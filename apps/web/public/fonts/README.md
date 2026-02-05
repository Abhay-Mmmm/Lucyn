# Milanesa Serif Font Setup

This website uses **Milanesa Serif** as its exclusive font.

## Current Font File

The font is currently provided as an OpenType font:

- `Milaness.otf` - OpenType format (currently in use)

## File Naming Convention

The font file is named `Milaness.otf` and is referenced in:
- `apps/web/app/globals.css` - @font-face declaration
- `apps/web/app/layout.tsx` - Critical inline CSS
- `apps/web/tailwind.config.ts` - Font family configuration

## Converting to Web-Ready Formats (Optional)

For better performance and browser compatibility, you can convert the OTF to web-optimized formats:

**Recommended formats:**
1. `WOFF2` (recommended, smallest file size, best compression)
2. `WOFF` (fallback for older browsers)
3. `TTF` (fallback for legacy support)

**Conversion tools:**
- [Transfonter](https://transfonter.org/) - Online converter
- [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)

**After conversion:**
1. Place the converted files in this directory
2. Update the @font-face src in `globals.css` and `layout.tsx` to include multiple formats
3. Example multi-format @font-face:
   ```css
   @font-face {
     font-family: 'Milanesa Serif';
     src: url('/fonts/Milaness.woff2') format('woff2'),
          url('/fonts/Milaness.woff') format('woff'),
          url('/fonts/Milaness.otf') format('opentype');
     font-weight: 400;
     font-style: normal;
     font-display: block;
   }
   ```

## Licensing

Ensure you have the appropriate license to use Milanesa Serif for web usage. This is a premium typeface from Sudtipos.

## Current Structure

```
public/
  fonts/
    Milaness.otf
    README.md
```
