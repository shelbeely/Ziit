<template>
  <dialog :open="open" class="list-modal" @close="$emit('close')">
    <div class="header">
      <h2 class="title">{{ title }}</h2>
      <button class="close-button" @click="$emit('close')">
        <LucideX />
      </button>
    </div>
    <div class="list-content" ref="listContentRef">
      <div
        v-for="item in sortedItems"
        :key="item.name"
        class="item"
        :style="{
          '--percentage': `${
            sortedItems.length > 0 && sortedItems[0].seconds > 0
              ? ((item.seconds / sortedItems[0].seconds) * 100).toFixed(1)
              : 0
          }%`,
        }"
      >
        <div class="name">{{ item.name || "Unknown" }}</div>
        <div class="percentage">{{ calculatePercentage(item.seconds) }}%</div>
        <div class="time">{{ formatTime(item.seconds) }}</div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PropType } from "vue";
import { LucideX } from "lucide-vue-next";

type Item = {
  name: string;
  seconds: number;
};

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array as () => Item[],
    required: true,
  },
  totalSeconds: {
    type: Number,
    required: true,
  },
  formatTime: {
    type: Function as PropType<(seconds: number) => string>,
    required: true,
  },
});

defineEmits(["close"]);

const listContentRef = ref<HTMLElement | null>(null);

const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => b.seconds - a.seconds);
});

const calculatePercentage = (seconds: number): string => {
  if (props.totalSeconds === 0) return "0.0";
  return ((seconds / props.totalSeconds) * 100).toFixed(1);
};

watch(
  () => props.open,
  (newOpen) => {
    if (!newOpen && listContentRef.value) {
      listContentRef.value.scrollTop = 0;
    }
  },
);
</script>

<style scoped lang="scss">
.list-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);
  border: none;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--md-sys-elevation-3);
  max-height: 80vh;
  border-radius: var(--md-sys-shape-corner-extra-large);

  &:not([open]) {
    display: none;
  }

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);

    .title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--md-sys-color-on-surface);
    }

    .close-button {
      background: none;
      border: none;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--md-sys-shape-corner-small);
      transition:
        background-color 0.2s ease,
        color 0.2s ease;

      &:hover {
        color: var(--md-sys-color-on-surface);
        background-color: var(--md-sys-color-surface-container-highest);
      }
    }
  }

  .list-content {
    overflow-y: auto;

    .item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      align-items: center;
      padding: 12px 16px;
      position: relative;
      overflow: hidden;
      height: auto;
      min-height: 48px;
      margin-bottom: 6px;
      border-radius: var(--md-sys-shape-corner-small);
      transition: background-color 0.2s ease;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background-color: var(--md-sys-color-surface-container-highest);
      }

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: var(--percentage);
        background: var(--md-sys-color-primary-container);
        opacity: 0.3;
        z-index: 0;
        transition: width 0.3s ease-in-out;
        border-radius: var(--md-sys-shape-corner-small);
      }

      .name,
      .time,
      .percentage {
        position: relative;
        z-index: 1;
        white-space: nowrap;
      }

      .name {
        font-weight: 500;
        color: var(--md-sys-color-on-surface);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .time {
        text-align: right;
        color: var(--md-sys-color-on-surface);
        font-weight: 600;
        min-width: 64px;
      }

      .percentage {
        text-align: right;
        color: var(--md-sys-color-on-surface-variant);
        font-weight: 500;
        font-size: 13px;
      }
    }
  }
}
</style>
