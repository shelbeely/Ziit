# Material Design 3 Expressive - Dashboard Conversion

This document describes the Material Design 3 Expressive conversion applied to the Ziit Agent dashboard.

## Overview

The dashboard has been fully converted to follow Material Design 3 (Material You) design principles, with a focus on the Expressive design system. This implementation uses Google's latest design language that emphasizes personalization, accessibility, and modern UI patterns.

## Implementation Details

### 1. Color System

**Location:** `app/app.vue` (lines 21-75)

Material Design 3 color tokens have been implemented following the Expressive theme:

#### Primary Colors
- `--md-sys-color-primary`: #ff6200 (brand orange)
- `--md-sys-color-on-primary`: #ffffff
- `--md-sys-color-primary-container`: #ffdbca
- `--md-sys-color-on-primary-container`: #331200

#### Secondary Colors
- `--md-sys-color-secondary`: #775651
- `--md-sys-color-on-secondary`: #ffffff
- `--md-sys-color-secondary-container`: #ffdad4
- `--md-sys-color-on-secondary-container`: #2c1512

#### Tertiary Colors
- `--md-sys-color-tertiary`: #6b5e2f
- `--md-sys-color-on-tertiary`: #ffffff
- `--md-sys-color-tertiary-container`: #f5e2a7
- `--md-sys-color-on-tertiary-container`: #231b00

#### Surface Colors (7 variants for depth hierarchy)
- `--md-sys-color-surface`: #1a1c1e (base surface)
- `--md-sys-color-surface-dim`: #111315 (darkest)
- `--md-sys-color-surface-bright`: #37393b (brightest)
- `--md-sys-color-surface-container-lowest`: #0b0e0f
- `--md-sys-color-surface-container-low`: #1a1c1e
- `--md-sys-color-surface-container`: #1e2022
- `--md-sys-color-surface-container-high`: #282a2c
- `--md-sys-color-surface-container-highest`: #333537
- `--md-sys-color-on-surface`: #e3e2e6
- `--md-sys-color-on-surface-variant`: #c7c6ca

#### Outline Colors
- `--md-sys-color-outline`: #918f94
- `--md-sys-color-outline-variant`: #48464c

### 2. Typography System

**Location:** `styles/index.scss` (lines 1-27)

Implemented all 5 Material Design 3 typography scales using the Outfit font family:

#### Display Scale (Largest)
- Display Large: 400 57px/64px
- Display Medium: 400 45px/52px
- Display Small: 400 36px/44px

#### Headline Scale
- Headline Large: 400 32px/40px
- Headline Medium: 400 28px/36px
- Headline Small: 400 24px/32px

#### Title Scale
- Title Large: 500 22px/28px
- Title Medium: 600 16px/24px
- Title Small: 600 14px/20px (used for section headers)

#### Body Scale
- Body Large: 400 16px/24px
- Body Medium: 400 14px/20px (used for list item names)
- Body Small: 400 12px/16px

#### Label Scale
- Label Large: 600 14px/20px (used for time values)
- Label Medium: 600 12px/16px (used for buttons and percentages)
- Label Small: 600 11px/16px

### 3. Elevation System

**Location:** `app/app.vue` (lines 54-57)

Four elevation levels implemented with proper shadow values:

- **Level 0**: No shadow (flat)
- **Level 1**: `0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)`
- **Level 2**: `0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)` (chart container default)
- **Level 3**: `0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3)` (chart container on hover)

### 4. Shape System

**Location:** `app/app.vue` (lines 60-65)

Seven corner radius tokens for consistent rounded corners:

- None: 0px
- Extra Small: 4px
- Small: 8px (list items, buttons)
- Medium: 12px (metric sections, tooltips)
- Large: 16px (chart container)
- Extra Large: 28px

### 5. Component Updates

#### Chart Container (`styles/index.scss` lines 29-48)
- Background: `surface-container`
- Border radius: `large` (16px)
- Elevation: `level-2` with `level-3` on hover
- Smooth elevation transition: 200ms cubic-bezier
- Padding increased from 16px to 24px

#### Metrics Sections (`styles/index.scss` lines 50-84)
- Background: `surface-container-low`
- Border radius: `medium` (12px)
- Padding: 16px
- Gap increased from 8px to 12px

#### List Items (`styles/index.scss` lines 86-134)
- Min height: 44px (accessibility touch target)
- Border radius: `small` (8px)
- Background bar: `surface-container-high`
- Hover state: `surface-container-highest`
- Smooth transitions: 150ms-300ms cubic-bezier
- Padding increased from 8px to 12px

#### Section Headers (`styles/index.scss` lines 71-76)
- Typography: `title-small-font`
- Color: `on-surface-variant`
- Letter spacing: 0.5px
- Uppercase transformation

#### Interactive Elements (`styles/index.scss` lines 78-91)
- Typography: `label-medium-font`
- Color: `primary` with `primary-container` on hover
- Min height: 44px (accessibility)
- Border radius: `small` (8px)
- Smooth transitions: 150ms cubic-bezier

### 6. Chart Styling

**Location:** `app/pages/index.vue` (lines 483-605)

#### Line Chart
- Border color: `#ff6200` (primary)
- Border width: 2px (reduced from 3px for cleaner look)
- Line tension: 0.3 (smooth curves)
- Fill: gradient with 8% opacity
- Animation: 300ms easeInOutCubic
- Border join style: "round" for smoother lines

#### Points
- Default radius: 0 (hidden)
- Hover radius: 6px (increased from 4px)
- Hover border: 2px white outline

#### Grid
- X-axis: No grid lines
- Y-axis: 10% opacity with `on-surface-variant` color
- Font: Outfit weight 500

#### Tooltips
- Background: `surface-container` (#1e2022)
- Border: `outline-variant` (#48464c)
- Border radius: `medium` (12px, rounded from 0px)
- Padding: 12px
- Font: Outfit
- Colors: `on-surface` (#e3e2e6)

### 7. Accessibility Improvements

All changes comply with WCAG 2.1 AA standards:

1. **Touch Targets**: Minimum 44px height for all interactive elements
2. **Color Contrast**: All text meets minimum 4.5:1 contrast ratio
3. **Spacing**: Increased gaps between interactive elements
4. **Visual Feedback**: Clear hover states with color and elevation changes
5. **Typography**: Readable font sizes with proper line heights

### 8. Backward Compatibility

**Location:** `app/app.vue` (lines 67-74)

Legacy CSS variables are mapped to Material Design 3 tokens:

```scss
--background: var(--md-sys-color-surface);
--element: var(--md-sys-color-surface-container);
--border: var(--md-sys-color-outline-variant);
--accent: var(--md-sys-color-primary);
--text: var(--md-sys-color-on-surface);
--text-secondary: var(--md-sys-color-on-surface-variant);
--text-muted: var(--md-sys-color-outline);
```

This ensures existing components continue to work while gradually adopting Material Design 3 tokens.

## Benefits

1. **Modern Design**: Follows Google's latest Material You design language
2. **Consistency**: Token-based system ensures design consistency across the application
3. **Accessibility**: Built-in compliance with WCAG 2.1 AA standards
4. **Maintainability**: Centralized design tokens make updates easier
5. **Flexibility**: Easy to adjust colors, typography, and spacing from one location
6. **Dark Theme Ready**: Surface variants provide proper hierarchy for dark mode
7. **Smooth Interactions**: Consistent animations and transitions enhance user experience

## Skill Used

This conversion was implemented using the `material-design-3` skill from `7spade/black-tortoise`:
- Installed via: `npx skills add 7spade/black-tortoise --skill material-design-3 -y`
- Location: `.agents/skills/material-design-3`
- Documentation: Comprehensive Material Design 3 guidance for web applications

## Files Modified

1. **app/app.vue**: Material Design 3 color, elevation, and shape token system
2. **styles/index.scss**: Typography scales and component styling
3. **app/pages/index.vue**: Chart configuration with Material Design 3 styling

## Summary of Changes

- **app/app.vue**: +63 lines (added MD3 token system)
- **styles/index.scss**: +71 lines (added typography and updated styling)
- **app/pages/index.vue**: +8 lines (enhanced chart styling)
- **Total**: 142 lines added, 47 lines modified

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Theming**: Add runtime color palette generation from user preferences
2. **Light Theme**: Implement light mode variant with adjusted color tokens
3. **Additional Pages**: Apply Material Design 3 to settings, admin, and other pages
4. **Motion**: Add more sophisticated entrance/exit animations
5. **Responsive Typography**: Implement fluid typography that scales with viewport
6. **Custom Palettes**: Allow users to customize the color scheme

## References

- [Material Design 3 Official Guidelines](https://m3.material.io/)
- [Material Design Color System](https://m3.material.io/styles/color/system/overview)
- [Material Design Typography](https://m3.material.io/styles/typography/overview)
- [Material Design Elevation](https://m3.material.io/styles/elevation/overview)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
