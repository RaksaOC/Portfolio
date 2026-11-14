# Themes

Each theme ("look") is one self-contained folder. `index.js` here is the registry that lists them.

```
themes/
  index.js          registry: LOOKS (order), findLook, Randomize weights, Featured / More groups
  fonts.js          Latin + Khmer font loading for themes
  shared/
    base.css        rules every theme shares (glass panels, accent buttons) - loads before the themes
    overrides.css   shared rules that must win over theme shapes (chat panel layouts, heading font)
    cursor-kit.js   cursor drawing helpers (arrow, ring, pixel art, gear)
    scene/
      kit.js        3D building blocks (decor container, particles, model loader, occluder)
      geometry.js   ridges + round trees used by several scenes
      sky.js        horizon glow, sun / moon, clouds, flower sprites (Japan, Desert)
      wire-car.js   neon wireframe car (Futuristic, Retro)
      ambient.js    one shared scene for themes without their own (bokeh, shapes, blocks, orbits, bars, code, embers)
  <id>/
    index.js        metadata: name, Khmer name, fonts, kmFonts, swatches, scene settings, loadScene, music, cursor
    theme.css       palette (dark + [data-theme="light"]) and signature card / button shapes, scoped to :root[data-look="<id>"]
    scene.js        its own 3D background (optional; otherwise `scene.ambient` picks a shared one)
    cursor.js       its mouse cursors (optional)
    music.m4a       its background track
    models/         its 3D models (optional, see MODEL-CREDITS.md)
```

## Adding a theme

1. Copy a similar theme's folder to `themes/<new-id>/` and edit `index.js` (keep `id` = folder name).
2. Edit `theme.css` (palette + shapes) and drop in `music.m4a`. Optionally add `scene.js` / `cursor.js`.
3. Import it in `themes/index.js` and add it to `LOOKS`. Add it to `FEATURED` there to put it in the top group.
4. If its headings should use `--look-display`, add it to the heading-font list in `shared/overrides.css`.
   Also set its phone chat-sheet corner `--sheet-r` in its `theme.css`.

Monochrome (`id: ''`) is the site default: its palette lives in `styles/global.css`, so it has no `theme.css` and no 3D decor.
