# Lucyn Font Setup

This website uses a dual-font system:
- **Absans** - Main UI font for body text, buttons, navigation, dashboard
- **Milanesa Serif** - Display font for landing page headings and branding

## Current Font Files

### Absans (Main UI Font)
Located in `absans-main/`:
- `Absans-Regular.woff2` - WOFF2 format (primary, best compression)
- `Absans-Regular.woff` - WOFF format (fallback)
- `Absans-Regular.otf` - OpenType format (legacy fallback)

### Milanesa Serif (Display Font)
- `Milaness.otf` - OpenType format

## Usage

### Absans (default)
Applied automatically to all UI elements via `font-sans` class.

### Milanesa Serif
Use the `font-display` class for headings:
```jsx
<h1 className="font-display text-5xl">Your Heading</h1>
```

## File References

Font configurations are in:
- `apps/web/app/globals.css` - @font-face declarations
- `apps/web/app/layout.tsx` - Critical inline CSS
- `apps/web/tailwind.config.ts` - Font family configuration

## Current Structure

```
public/
  fonts/
    Milaness.otf
    README.md
    absans-main/
      Absans-Regular.woff2
      Absans-Regular.woff
      Absans-Regular.otf
```
