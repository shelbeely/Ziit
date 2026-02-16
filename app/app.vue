<template>
  <div>
    <NuxtPwaManifest />
    <UiToast />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useKeybind({
  keys: ["f"],
  run() {
    useToast().success("You payed respect to the easter egg");
  },
  config: { ignoreIfEditable: true },
});
</script>

<style lang="scss">
@use '~~/styles/material-design-3-tokens.scss';

// Keep legacy variables for backward compatibility
:root {
  --background: var(--md3-background);
  --element: var(--md3-surface-container);
  --border: var(--md3-outline-variant);

  --accent: var(--md3-primary);

  --text: var(--md3-on-surface);
  --text-secondary: var(--md3-on-surface-variant);
  --text-muted: var(--md3-outline);
}

@font-face {
  font-family: ChivoMono;
  src: url("~~/fonts/ChivoMono.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
  font-weight: 400;
}

@font-face {
  font-family: Outfit;
  src: url("~~/fonts/Outfit.woff2") format("woff2");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
  font-weight: 100 900;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--md3-background);
  color: var(--md3-on-background);
  font-size: var(--md3-typescale-body-medium-size);
  font-family: Outfit;
  overflow-x: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-color: var(--md3-on-surface-variant) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--md3-surface-container-low);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--md3-on-surface-variant);
    border-radius: var(--md3-shape-corner-full);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--md3-primary);
  }
}

button,
input {
  font-family: Outfit;
  font-size: var(--md3-typescale-body-medium-size);
}

a {
  text-decoration: none;
  color: var(--md3-on-surface);
  transition: color var(--md3-motion-duration-short4) var(--md3-motion-easing-standard);

  &:hover {
    color: var(--md3-primary);
  }
}
</style>
