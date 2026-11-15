# liquidglass (vendored)

`liquid-glass.js` and `components.js` v1.0.0 from https://liquidglass.dev/lib/
(source: https://github.com/gentpan/liquidglass, MIT licence; toast icons from Lucide, ISC).

Copied in rather than loaded from liquidglass.dev at runtime, because those URLs are not versioned.
Used for the settings switches (`<lg-switch>`) and the curved-glass lens on the pinned-track cards
(`createGlass`, from `src/core/pinScroll.js`).

Local change: `createGlass` takes an `onFilter(ref)` option that receives the filter reference instead of
it being written to `target.style`, so it can be chained with the theme's own glass filter.
