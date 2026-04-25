---
name: Sentinel Integrity
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f1f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#343536'
  on-surface: '#e4e2e4'
  on-surface-variant: '#c5c6cd'
  inverse-surface: '#e4e2e4'
  inverse-on-surface: '#303032'
  outline: '#8f9097'
  outline-variant: '#44474d'
  surface-tint: '#b9c7e4'
  primary: '#b9c7e4'
  on-primary: '#233148'
  primary-container: '#0a192f'
  on-primary-container: '#74829d'
  inverse-primary: '#515f78'
  secondary: '#b8c8da'
  on-secondary: '#223240'
  secondary-container: '#394857'
  on-secondary-container: '#a7b7c8'
  tertiary: '#b6c6ed'
  on-tertiary: '#20304f'
  tertiary-container: '#061836'
  on-tertiary-container: '#7282a5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#d4e4f6'
  secondary-fixed-dim: '#b8c8da'
  on-secondary-fixed: '#0d1d2a'
  on-secondary-fixed-variant: '#394857'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#b6c6ed'
  on-tertiary-fixed: '#091b39'
  on-tertiary-fixed-variant: '#374767'
  background: '#131315'
  on-background: '#e4e2e4'
  surface-variant: '#343536'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  container-padding: 20px
  bento-gap: 12px
---

## Brand & Style

The brand personality is vigilant, uncompromising, and deeply analytical. This design system is built for high-stakes decision-making environments where clarity and authority are paramount. The visual language conveys a sense of "digital watchtower" security—reliable and constant.

The chosen style is a blend of **Corporate Modern** and **Minimalism**, specifically optimized for a **Bento Box** modular layout. This approach organizes vast amounts of complex data into digestible, high-density modules. By using a dark, sophisticated backdrop with precise structural elements, the UI focuses the user’s attention on critical alerts and patterns without visual fatigue.

## Colors

The palette is anchored by Deep Navy (#0A192F), establishing an authoritative and immersive dark mode environment. Slate Gray (#708090) serves as the primary functional color for borders, secondary text, and iconography, providing a soft contrast that reduces eye strain during long review sessions.

Signal Red (#E53E3E) and Signal Green (#38A169) are reserved strictly for status indicators and high-priority actions. Their saturation is tuned to "pop" against the dark background, ensuring that threats and approvals are instantly recognizable. Surface layers use a slightly lighter navy (#112240) to distinguish interactive modules from the base canvas.

## Typography

The typography in this design system utilizes **Inter** for its exceptional legibility and neutral, systematic character. The scale is designed to prioritize data density and information hierarchy. 

Headlines are tight and bold to establish clear sectional anchors. Body text is optimized for readability against dark backgrounds, using a slightly increased line height. For technical data—such as IP addresses, timestamps, or user IDs—a monospace fallback is used to ensure character distinction and alignment. Label styles use uppercase tracking to differentiate meta-information from primary content.

## Layout & Spacing

The design system employs a **Fluid Bento Grid** model. The layout is based on a 12-column system, but content is contained within "Bento Boxes"—modular cards that can span multiple columns and rows. 

The spacing rhythm is built on a 4px base unit. A consistent 12px gap between modules ensures the UI remains dense without feeling cluttered. Margins and paddings within modules are kept tight (typically 16px or 20px) to maximize the "above the fold" visibility of analytical data. The objective is to minimize vertical scrolling by organizing related insights into side-by-side modular tiles.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows. The background is the darkest value, with "Bento" modules sitting one level above it using a slightly lighter navy hex.

To create separation, modules utilize a 1px solid border using Slate Gray at 20% opacity. For active or hovered states, a subtle ambient shadow (0px 4px 20px rgba(0,0,0, 0.4)) may be applied to lift the element. This approach maintains a flat, technical aesthetic while providing just enough depth to communicate interactivity and containment.

## Shapes

The design system adopts a **Soft** shape language. A standard border radius of 0.25rem (4px) is applied to all modules, buttons, and input fields. This subtle rounding softens the "brutalist" feel of the dense grid while maintaining a professional and serious architectural tone. Larger containers or parent cards may use up to 0.5rem (8px) to signify grouping, but the overall aesthetic remains crisp and disciplined.

## Components

### Buttons
Primary buttons use a solid Slate Gray or Deep Navy with a high-contrast white label. Action-specific buttons (e.g., "Ban User" or "Approve") use Signal Red and Signal Green, respectively, but only in high-stakes contexts.

### Bento Cards
The core container for the platform. These include a subtle 1px border and an optional header area for titles and small icon-actions. They are designed to be "data-dense," often containing tables, sparklines, or lists.

### Chips & Tags
Used for status and categories. Tags should be outlined or have a low-opacity background tint of the status color to remain secondary to the primary content.

### Input Fields
Inputs are minimalist, featuring a 1px border and a dark background that is slightly deeper than the card it sits on. Focus states are indicated by a subtle brightening of the border color.

### Data Lists
Lists utilize zebra-striping with subtle tonal shifts rather than heavy dividers to keep the interface clean. High-priority items in a list may feature a vertical "Signal" bar on the far left edge.

### Additional Components
- **Risk Meters:** Circular or linear gauges using the Signal color scale.
- **Audit Logs:** A specialized list component using the `data-mono` typography for timestamps and event IDs.
- **Trend Sparklines:** Simplified, stroke-only charts integrated directly into Bento modules.