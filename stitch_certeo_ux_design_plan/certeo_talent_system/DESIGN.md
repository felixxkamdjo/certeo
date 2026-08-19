---
name: Certeo Talent System
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f2'
  surface-container: '#EFEDED'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1b'
  on-surface-variant: '#584235'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0ef'
  outline: '#8c7263'
  outline-variant: '#e0c0af'
  surface-tint: '#9a4600'
  primary: '#9a4600'
  on-primary: '#ffffff'
  primary-container: '#ff7900'
  on-primary-container: '#5c2700'
  inverse-primary: '#ffb68c'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5e5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a09f9f'
  on-tertiary-container: '#363636'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#fbf9f8'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e1'
  outline-warm: '#8C7263'
  success-green: '#2E7D32'
  error-red: '#BA1A1A'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  max-width: 1280px
---

## Brand & Style

This design system is built on a **Corporate / Modern** aesthetic, specifically tailored for a high-efficiency talent management ecosystem. The brand personality is professional, authoritative, and innovative, balancing the energy of its vibrant primary palette with a structured, administrative layout.

The visual narrative focuses on:
- **Efficiency:** A lean interface that minimizes cognitive load for HR administrators and talent managers.
- **Reliability:** Solid, geometric structures that convey institutional stability.
- **Vibrancy:** Strategic use of high-chroma orange to highlight progress, action, and success within the platform.
- **Cleanliness:** Ample whitespace and a refined grayscale palette ensure that complex data remains the focal point.

## Colors

The color strategy centers on **Orange (#FF7900)** as the primary driver of interaction and brand identity. This is paired with deep, near-black neutrals to provide a sophisticated, high-contrast environment.

- **Primary:** Reserved for high-priority calls to action, active states, and brand-critical indicators.
- **Secondary:** Used for global navigation, headers, and primary text to ground the interface.
- **Neutral:** A range of warm-tinted grays and off-whites are used to create "Surface-Container" tiers, replacing traditional borders with subtle tonal shifts.
- **Functional Tints:** Status colors (Success, Error, Warning) should be used with low-saturation backgrounds and high-saturation text/icons for maximum accessibility within the dashboard.

## Typography

The design system exclusively utilizes **Hanken Grotesk** to maintain a cohesive, modern sans-serif feel. Its geometric clarity supports both large-scale brand statements and dense data visualization.

- **Scale & Weight:** Headlines use aggressive weights (700-800) to create a clear hierarchy against body text. 
- **Readability:** Body text is optimized with a 1.5x line height and standard character spacing to ensure long-form reports are legible.
- **Utility:** Labels and metadata use SemiBold weights and occasional uppercase styling to distinguish them from interactive content.

## Layout & Spacing

This system employs a **Fluid Grid** model based on an 8px square rhythm. This ensures all components scale predictably across different screen sizes.

- **Grid System:** Use a 12-column grid for desktop views. For administrative dashboards, the sidebar is fixed at 280px, with the remaining area expanding to a maximum width of 1280px.
- **Breakpoints:**
    - **Desktop (1024px+):** 12 columns, 40px margins.
    - **Tablet (768px - 1023px):** 8 columns, 24px margins.
    - **Mobile (Up to 767px):** 4 columns, 16px margins.
- **Rhythm:** Internal component spacing should use 8px or 16px increments. Section-level spacing should use 32px or 48px to create distinct visual breaks.

## Elevation & Depth

Visual hierarchy is established primarily through **Tonal Layers** and **Low-contrast outlines**. This keeps the interface feeling flat and modern while still providing clear depth cues.

- **Stacking:** The background uses the neutral base (#FBF9F8). Cards and primary containers use the lowest surface color (#FFFFFF) to appear "closer" to the user.
- **Shadows:** Use a single, refined "Soft Tech Shadow" for floating elements like modals or active cards: `0 4px 12px rgba(27, 28, 28, 0.05)`.
- **Borders:** Use subtle 1px outlines (#EFEDED) for containers and fields to define boundaries without adding visual noise. High-emphasis focus states should use the Primary Orange for the border.

## Shapes

The design system follows a **Rounded** (8px/0.5rem) philosophy. This softens the industrial nature of the dashboard and creates a more approachable user experience.

- **Standard Elements:** Buttons, input fields, and small cards use the base 8px radius.
- **Large Containers:** Modals and primary dashboard sections use `rounded-lg` (16px) to emphasize their role as distinct workspaces.
- **Pill-Shaped:** Small badges, status chips, and toggle switches use the maximum radius (rounded-full) to distinguish them from larger layout blocks.

## Components

### Buttons
- **Primary:** Solid #FF7900 background with white text. High-contrast, no shadow.
- **Secondary:** Solid #1B1C1C background with white text for secondary administrative actions.
- **Ghost/Tertiary:** No background, #FF7900 text. Used for low-priority actions like "Cancel" or "Go Back."

### Cards
- **Structure:** White background, 16px corner radius, 1px subtle border, and the "Soft Tech Shadow."
- **Dashboard Widgets:** Include a 4px left-aligned primary orange accent bar for "Active" or "Critical" data summaries.

### Input Fields
- **Default:** White background, 1px #EFEDED border, 8px corner radius.
- **Active/Focus:** 2px solid #FF7900 border. Labels sit 8px above the field in Label-MD styling.

### Data Tables
- **Header:** #EFEDED background with Label-MD text.
- **Row:** 1px bottom-border only (#EFEDED). Hover state uses #F5F3F3.
- **Density:** 12px vertical padding for standard views; 8px for "compact" data-heavy views.

### Chips & Badges
- **Status:** Use the 10% opacity version of the status color (e.g., 10% Orange) with full-saturation text for high legibility and a modern look.
- **Shape:** Always pill-shaped.