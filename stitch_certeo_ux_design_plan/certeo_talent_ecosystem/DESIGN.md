---
name: CERTEO Talent Ecosystem
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#584235'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
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
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#9fa0a0'
  on-tertiary-container: '#353737'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68c'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#753400'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
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
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered to embody the **Corporate / Modern** aesthetic of the Orange Digital Center. It reflects a brand personality that is innovative, institutional, and highly efficient. The visual language balances the boldness of the Orange identity with the precision of a high-tech talent management ecosystem.

The system emphasizes:
- **Clarity and Precision:** A clean, functional interface that prioritizes data legibility and task efficiency.
- **Institutional Authority:** Solid blocks of color and structured layouts that communicate reliability.
- **High-Tech Innovation:** Subtle use of depth and a refined typographic hierarchy to suggest a forward-thinking digital environment.

## Colors

The palette is strictly governed by the Orange brand heritage. It utilizes a high-contrast foundation to ensure accessibility and professional impact.

- **Primary (#FF7900):** Used for primary actions, progress indicators, and key brand moments. It must be used purposefully to guide attention without overwhelming the user.
- **Pure Black (#000000):** Used for primary headings, high-level navigation, and text to ensure maximum readability and a premium feel.
- **Pure White (#FFFFFF):** The default background color to maintain a "clean" and "airy" workspace.
- **Functional Grays:** A spectrum of grays (from #F6F6F6 for backgrounds to #666666 for secondary text) is used to create hierarchy and interface boundaries without introducing new hues.

## Typography

This design system utilizes **Hanken Grotesk** for all roles. It is a modern sans-serif that provides the technical precision of Helvetica with a slightly more contemporary, open feel suitable for SaaS environments.

- **Headlines:** Set in Bold or ExtraBold weights. Use tight letter spacing for large display sizes to maintain the "high-tech" look.
- **Body Text:** Always set in Regular weight with generous line height (1.5x) to ensure comfortable reading of talent profiles and reports.
- **Labels:** Use SemiBold with uppercase styling for table headers and small metadata tags to differentiate them from body content.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict adherence to an 8px base unit. This ensures vertical rhythm across all components.

- **Desktop:** 12-column grid. Sidebars are fixed at 280px, while the main content area remains fluid up to a maximum width of 1280px.
- **Tablet:** 8-column grid. Margins reduce to 24px.
- **Mobile:** 4-column grid. Margins reduce to 16px. Forms must reflow to a single column, with inputs expanding to the full width of the container.
- **Rhythm:** Use `16px` (2 units) for related elements and `32px` (4 units) for distinct sections or card grouping.

## Elevation & Depth

To maintain a clean and professional look, this design system uses **Tonal Layers** combined with **Low-contrast outlines**. 

- **Surface Levels:** The primary background is White (#FFFFFF). Secondary sections (like sidebars or background containers) use a Light Gray (#F6F6F6) to create subtle separation.
- **Shadows:** Avoid heavy dropshadows. Use a "Soft Tech Shadow" for cards: `0 4px 12px rgba(0, 0, 0, 0.05)`. This creates a sense of lift without cluttering the UI.
- **Borders:** Active states and input fields use a 1px solid border. Use `#000000` for high-emphasis focus and `#E0E0E0` for inactive or neutral states.

## Shapes

The design system uses a **Rounded** shape language to soften the institutional feel and improve approachability.

- **Components:** Standard buttons, input fields, and chips utilize a 0.5rem (8px) radius as requested.
- **Containers:** Larger containers like cards and modals should use `rounded-lg` (16px) to clearly define the workspace.
- **Interactive Elements:** Ensure that the corner radius is consistent across all form elements to maintain a professional, systematic appearance.

## Components

### Buttons
- **Primary:** Solid `#FF7900` with White text. No border.
- **Secondary:** Solid `#000000` with White text. 
- **Outline:** 1px border of the brand color with transparent background.
- **Sizing:** Minimum height of 48px for mobile-first accessibility.

### Cards
- **Style:** White background, 16px corner radius, and the Soft Tech Shadow.
- **Padding:** 24px internal padding for desktop, 16px for mobile.
- **Header:** Often includes a 4px left-accent border in Primary Orange for high-priority items.

### Data Tables
- **Header:** Light gray (#F6F6F6) background with uppercase black labels.
- **Rows:** 1px bottom border in light gray. No vertical borders.
- **Interactions:** Rows should have a subtle hover state (#FAFAFA).

### Input Fields
- **Default:** 1px border (#E0E0E0) with 8px radius.
- **Focus:** 2px border (#FF7900) to provide clear visual feedback.
- **Labels:** Positioned above the field in Bold 14px text.

### Chips & Tags
- **Status Tags:** Use light-tint backgrounds with dark text (e.g., a 10% opacity orange background for "In Progress").
- **Shape:** Fully pill-shaped (rounded-xl) for quick visual scanning.