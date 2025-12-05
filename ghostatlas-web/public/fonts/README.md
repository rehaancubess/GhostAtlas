# GhostAtlas Web Fonts

## Font Configuration

The GhostAtlas web application uses two primary fonts:

### 1. Creepster (Horror Theme Font)
- **Usage**: Headings (h1-h6) and horror-themed text
- **Source**: Google Fonts CDN
- **Import**: Automatically loaded via `src/styles/index.css`
- **Font Family**: `'Creepster', cursive`
- **Color**: Ghost Green (#00FF41)

### 2. Inter (Body Text Font)
- **Usage**: Body text, paragraphs, UI elements
- **Source**: Google Fonts CDN
- **Import**: Automatically loaded via `src/styles/index.css`
- **Font Family**: `'Inter', system-ui, sans-serif`
- **Weights**: 300, 400, 500, 600, 700

## Font Loading Strategy

Fonts are loaded using Google Fonts CDN with `display=swap` parameter for optimal performance:
- Prevents invisible text during font loading
- Shows fallback font immediately
- Swaps to custom font when loaded

## Local Font Installation (Optional)

If you prefer to host fonts locally for offline support or performance:

1. Download Creepster from Google Fonts
2. Place font files in this directory
3. Update `src/styles/index.css` to use local font files:

```css
@font-face {
  font-family: 'Creepster';
  src: url('/fonts/Creepster-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

## Font Usage in Components

### Headings
```tsx
<h1 className="font-creepster text-ghost-green">Haunted Title</h1>
```

### Body Text
```tsx
<p className="font-sans text-ghost-gray">Regular paragraph text</p>
```

### With Glow Effect
```tsx
<h2 className="font-creepster text-ghost-green text-glow">
  Glowing Horror Text
</h2>
```
