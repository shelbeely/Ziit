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
:root {
  /* Material Design 3 - Expressive Color System */
  /* Note: Background color changed from #191919 to #1c1b1f for MD3 compliance */
  /* Surface Colors */
  --md-sys-color-background: #1c1b1f;
  --md-sys-color-surface: #1c1b1f;
  --md-sys-color-surface-dim: #141316;
  --md-sys-color-surface-bright: #3b383e;
  --md-sys-color-surface-container-lowest: #0f0e11;
  --md-sys-color-surface-container-low: #1c1b1f;
  --md-sys-color-surface-container: #201f23;
  --md-sys-color-surface-container-high: #2b292d;
  --md-sys-color-surface-container-highest: #363438;

  /* Primary Colors - Orange accent */
  --md-sys-color-primary: #ffb68c;
  --md-sys-color-on-primary: #4f2600;
  --md-sys-color-primary-container: #703900;
  --md-sys-color-on-primary-container: #ffdcc5;

  /* Text Colors */
  --md-sys-color-on-surface: #e6e1e6;
  --md-sys-color-on-surface-variant: #ccc4cf;
  --md-sys-color-outline: #958e99;
  --md-sys-color-outline-variant: #49454e;

  /* Legacy compatibility */
  --background: var(--md-sys-color-background);
  --element: var(--md-sys-color-surface-container);
  --border: var(--md-sys-color-outline-variant);
  --accent: var(--md-sys-color-primary);
  --text: var(--md-sys-color-on-surface);
  --text-secondary: var(--md-sys-color-on-surface-variant);
  --text-muted: var(--md-sys-color-outline);

  /* MD3 Elevation Shadows */
  --md-sys-elevation-1:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-2:
    0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-3:
    0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3);

  /* MD3 Shape - Rounded corners */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
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
  background-color: var(--background);
  color: var(--text);
  font-size: 14px;
  font-family: Outfit;
  overflow-x: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-color: var(--text-secondary) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--text-secondary);
  }
}

button,
input {
  font-family: Outfit;
  font-size: 14px;
}

a {
  text-decoration: none;
  color: var(--text);
}
</style>
