# GhostAtlas Theme System Guide

## Overview

The GhostAtlas web application uses a comprehensive horror-themed design system built with Tailwind CSS and custom CSS properties. This guide documents all available theme tokens, utilities, and best practices.

## Color Palette

### Primary Colors
- **Ghost Black**: `#000000` - Primary background color
- **Ghost Near-Black**: `#0A0A0A` - Secondary background, cards
- **Ghost Green**: `#00FF41` - Primary accent color for interactive elements
- **Ghost Gray**: `#E0E0E0` - Primary text color
- **Ghost White**: `#FFFFFF` - High-contrast text

### Secondary Colors
- **Ghost Dark Gray**: `#1A1A1A` - Borders, dividers
- **Ghost Medium Gray**: `#333333` - Hover states, secondary elements

### Usage in Tailwind
```tsx
<div className="bg-ghost-black text-ghost-gray border-ghost-green">
  Content
</div>
```

## Typography

### Font Families
- **Creepster**: Horror-themed display font for headings
- **Inter**: Clean sans-serif for body text

### Font Sizes
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)

### Typography Examples
```tsx
// Heading with glow
<h1 className="font-creepster text-5xl text-ghost-green text-glow">
  Haunted Title
</h1>

// Body text
<p className="font-sans text-base text-ghost-gray">
  Regular paragraph text
</p>

// Link with hover effect
<a href="#" className="text-ghost-green hover:text-glow">
  Clickable Link
</a>
```

## Spacing

Use Tailwind's spacing scale with custom additions:
- Standard: `p-1` through `p-96`
- Custom: `p-18` (4.5rem), `p-88` (22rem), `p-128` (32rem)

## Shadows & Glows

### Green Glow Effects
```tsx
// Text glow
<span className="text-glow">Glowing text</span>
<span className="text-glow-md">Medium glow</span>
<span className="text-glow-lg">Large glow</span>
<span className="text-glow-xl">Extra large glow</span>

// Box glow
<div className="box-glow">Glowing box</div>
<div className="shadow-green-glow">Tailwind glow</div>
<div className="shadow-green-glow-lg">Large Tailwind glow</div>

// Hover glow
<button className="glow-on-hover">Hover me</button>
```

### Vignette Effects
```tsx
// Standard vignette
<div className="vignette">
  <img src="image.jpg" alt="Haunted" />
</div>

// Large vignette
<div className="vignette-lg">
  <img src="image.jpg" alt="Very haunted" />
</div>
```

## Animations

### Available Animations
```tsx
// Pulse green
<div className="animate-pulse-green">Pulsing element</div>

// Fade in
<div className="animate-fade-in">Fading in</div>

// Slide up
<div className="animate-slide-up">Sliding up</div>

// Glow pulse
<div className="animate-glow-pulse">Pulsing glow</div>
```

### Custom Animation Durations
- `duration-150`: 150ms
- `duration-250`: 250ms (custom)
- `duration-300`: 300ms
- `duration-350`: 350ms (custom)
- `duration-400`: 400ms

## Background Effects

### Fog Effect
```tsx
<div className="fog-effect h-32">
  Atmospheric fog overlay
</div>
```

### Radial Gradient
```tsx
<div className="gradient-radial">
  Green radial glow from center
</div>
```

### Green Fade
```tsx
<div className="gradient-green-fade">
  Fading green gradient
</div>
```

## Borders

### Glowing Borders
```tsx
<div className="border-glow rounded-lg p-4">
  Standard glowing border
</div>

<div className="border-glow-lg rounded-lg p-4">
  Large glowing border
</div>
```

## Interactive Elements

### Buttons
```tsx
// Primary button
<button className="px-6 py-3 bg-ghost-green text-ghost-black font-semibold rounded-lg shadow-green-glow hover:shadow-green-glow-lg transition-all duration-250">
  Primary Action
</button>

// Ghost button
<button className="px-6 py-3 bg-transparent border-2 border-ghost-green text-ghost-green rounded-lg hover:bg-ghost-green hover:text-ghost-black transition-all duration-250">
  Ghost Action
</button>

// Danger button
<button className="px-6 py-3 bg-ghost-near-black border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-ghost-black transition-all duration-250">
  Danger Action
</button>
```

### Cards
```tsx
<div className="bg-ghost-near-black border border-ghost-green rounded-lg p-6 shadow-green-glow hover:shadow-green-glow-lg transition-all duration-300">
  <h3 className="font-creepster text-2xl text-ghost-green mb-2">Card Title</h3>
  <p className="text-ghost-gray">Card content goes here</p>
</div>
```

### Links
```tsx
<a href="#" className="text-ghost-green hover:text-glow transition-all duration-150">
  Hover for glow effect
</a>
```

## Loading States

### Skeleton Loader
```tsx
<div className="loading-skeleton h-8 w-full rounded"></div>
```

## Accessibility

### Focus States
All interactive elements automatically receive green focus rings:
```tsx
<button className="...">
  Automatically gets green focus ring
</button>
```

### Skip to Content
```tsx
<a href="#main-content" className="skip-to-content">
  Skip to content
</a>
```

### Screen Reader Only
```tsx
<span className="sr-only">Hidden from visual users</span>
```

## Scrollbar Styling

Custom scrollbars are automatically applied:
- Track: Ghost near-black
- Thumb: Ghost green with glow on hover
- Works in WebKit browsers and Firefox

## Selection Styling

Text selection automatically uses:
- Background: Ghost green
- Text: Ghost black

## Responsive Design

Use Tailwind's responsive prefixes:
```tsx
<div className="text-base md:text-lg lg:text-xl">
  Responsive text size
</div>

<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

## Dark Mode

The theme is inherently dark. No dark mode toggle needed.

## Best Practices

1. **Always use theme colors**: Use `text-ghost-green` instead of `text-green-500`
2. **Consistent spacing**: Use the spacing scale consistently
3. **Glow effects**: Use sparingly for emphasis
4. **Animations**: Respect `prefers-reduced-motion`
5. **Contrast**: Ensure text meets WCAG AA standards (4.5:1 ratio)
6. **Focus states**: Never remove focus indicators
7. **Font usage**: Creepster for headings, Inter for body

## CSS Custom Properties

For advanced use cases, access CSS variables directly:
```css
.custom-element {
  color: var(--color-ghost-green);
  box-shadow: var(--shadow-green-glow);
  font-family: var(--font-family-creepster);
  transition: all var(--transition-base);
}
```

## Examples

### Hero Section
```tsx
<section className="min-h-screen bg-ghost-black flex items-center justify-center p-8">
  <div className="text-center">
    <h1 className="font-creepster text-6xl text-ghost-green mb-4 text-glow animate-fade-in">
      GhostAtlas
    </h1>
    <p className="text-ghost-gray text-xl mb-8 animate-slide-up">
      Where the paranormal meets reality
    </p>
    <button className="px-8 py-4 bg-ghost-green text-ghost-black font-semibold rounded-lg shadow-green-glow hover:shadow-green-glow-xl transition-all duration-300">
      Explore Encounters
    </button>
  </div>
</section>
```

### Story Card
```tsx
<article className="bg-ghost-near-black border border-ghost-green rounded-lg overflow-hidden shadow-green-glow hover:shadow-green-glow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
  <div className="vignette">
    <img src="encounter.jpg" alt="Haunted location" className="w-full h-48 object-cover" />
  </div>
  <div className="p-6">
    <h3 className="font-creepster text-2xl text-ghost-green mb-2">
      The Abandoned Asylum
    </h3>
    <p className="text-ghost-gray text-sm mb-4">
      October 31, 2024 • New Orleans, LA
    </p>
    <p className="text-ghost-gray">
      A chilling encounter in the dead of night...
    </p>
  </div>
</article>
```
