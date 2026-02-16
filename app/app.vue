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
  /* Material Design 3 Color System - Expressive */
  --md-sys-color-primary: #ff6200;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #ffdbca;
  --md-sys-color-on-primary-container: #331200;
  
  --md-sys-color-secondary: #775651;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #ffdad4;
  --md-sys-color-on-secondary-container: #2c1512;
  
  --md-sys-color-tertiary: #6b5e2f;
  --md-sys-color-on-tertiary: #ffffff;
  --md-sys-color-tertiary-container: #f5e2a7;
  --md-sys-color-on-tertiary-container: #231b00;
  
  /* Surface Colors */
  --md-sys-color-surface: #1a1c1e;
  --md-sys-color-surface-dim: #111315;
  --md-sys-color-surface-bright: #37393b;
  --md-sys-color-surface-container-lowest: #0b0e0f;
  --md-sys-color-surface-container-low: #1a1c1e;
  --md-sys-color-surface-container: #1e2022;
  --md-sys-color-surface-container-high: #282a2c;
  --md-sys-color-surface-container-highest: #333537;
  --md-sys-color-on-surface: #e3e2e6;
  --md-sys-color-on-surface-variant: #c7c6ca;
  
  /* Outline */
  --md-sys-color-outline: #918f94;
  --md-sys-color-outline-variant: #48464c;
  
  /* Elevation */
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level2: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
  
  /* Shape */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  
  /* Legacy support */
  --background: var(--md-sys-color-surface);
  --element: var(--md-sys-color-surface-container);
  --border: var(--md-sys-color-outline-variant);
  --accent: var(--md-sys-color-primary);
  --text: var(--md-sys-color-on-surface);
  --text-secondary: var(--md-sys-color-on-surface-variant);
  --text-muted: var(--md-sys-color-outline);
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
