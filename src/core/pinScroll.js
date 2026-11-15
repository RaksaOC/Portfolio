// Pinned horizontal scroll, shared by the Experience timeline and the Skills groups.
//
// Markup: outer (tall, height = outerHeight) > sticky (100vh, position: sticky) > viewport > track.
// While the outer element is on screen the sticky panel stays put and vertical scrolling is turned
// into horizontal movement of the track. Once the end is reached, normal vertical scrolling resumes.
//
// Edge fade where the track meets the viewport's left / right edges (styles in src/styles/global.css):
//  - "edge-fade": a gradient mask lined up with the viewport edges, for card contents and plain lines.
//  - "edge-shell": glass surfaces. Chrome ignores a mask on an element with backdrop-filter, so these
//    curve away instead, like a coverflow: towards an edge they shrink, swing back in 3D around their
//    inner side and fade (--edge-s / --edge-r / --edge-origin, applied by .edge-shell, and --edge-o for
//    opacity, which each section applies itself since it also drives the reveal).
//    The glass itself curves too: each card gets a real liquid-glass lens (vendor/liquidglass) chained in
//    front of the theme's glass via --lg-url, bending the background harder the closer it gets to the edge.
//    Desktop Chromium with glass refraction on only, like the theme's own distortion.
// Nothing is masked at the viewport level: that would make it a "backdrop root", and the glass cards
// inside could no longer bend the 3D background behind them.
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { lenis } from './lenis';
import { gfxActive, canRefract } from './gfx';
import { createGlass } from '../vendor/liquidglass/liquid-glass.js';

const EDGE = 72; // fade width in px; keep in sync with --edge in global.css
const SHELL_FADE = 160; // a glass shell is fully faded out once less than this much of it is on screen
// Edge curve defaults; a section can override any of them (`edge` option)
const EDGE_DEFAULTS = {
    start: 0.3, // shells start to curve once their centre is this far from the middle (0 = middle, 1 = edge)
    tilt: 38, // deg of rotateY at the edge
    minScale: 0.8, // scale at the edge
    bend: 44, // px the curved-glass lens bends the background at the edge
};

const lensAllowed = computed(() => canRefract && !!gfxActive.value.refraction);

// Curved-glass lens for one card. Starts hidden; fadeEdges() bends it as the card nears an edge.
function makeLens(el) {
    return createGlass(el, {
        mode: 'backdrop',
        fit: true,
        radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
        refraction: 0,
        bezel: 0.9, // nearly a full dome: the whole pane reads as curved, not just its rim
        curvature: 2, // round profile
        chroma: 0.18,
        blur: 0,
        specular: 0, // the themes draw their own highlights
        hidden: true,
        // chain the lens in front of the theme's glass (base.css: backdrop-filter: var(--lg-url) …)
        onFilter: (ref) => {
            if (ref) el.style.setProperty('--lg-url', `${ref} url(#liquid-glass)`);
            else el.style.removeProperty('--lg-url');
        },
    });
}

/**
 * @param {object} [opts]
 * @param {(travelled: number, rect: DOMRect) => void} [opts.onUpdate] runs after every scroll update
 * @param {() => boolean} [opts.curve] edge shells curve away (tilt / shrink / glass lens) instead of only fading
 * @param {() => number | null} [opts.getDistance] scroll distance to use instead of the track's overflow
 *   (the Skills ribbon rotates instead of sliding); null falls back to the overflow
 * @param {Partial<typeof EDGE_DEFAULTS>} [opts.edge] how strongly things curve / shrink / bend
 * @param {number} [opts.focus] flat mode only: width (px) of a centred in-focus column. Shells partly outside
 *   it turn ghostly and soft (--edge-o lower, --edge-blur for their content, a touch smaller) by how much of
 *   them is outside, for a track that runs wider than the page column
 */
export function usePinnedScroll({ onUpdate, curve = () => true, getDistance, edge = {}, focus = 0 } = {}) {
    const E = { ...EDGE_DEFAULTS, ...edge };
    // 0 in the middle → 1 at an edge (eased), by the element's centre; sign = which side
    const edgeT = (x, width) => {
        const u = (x + width / 2 - viewportWidth / 2) / (viewportWidth / 2);
        const t = Math.min(1, Math.max(0, (Math.abs(u) - E.start) / (1 - E.start)));
        return { u, t: t * t * (3 - 2 * t) };
    };
    const outerRef = ref(null);
    const stickyRef = ref(null);
    const viewportRef = ref(null);
    const trackRef = ref(null);

    const outerHeight = ref(0);
    const translate = ref(0);
    const progress = ref(0);

    let distance = 0; // horizontal distance the track has to travel
    let viewportWidth = 0;
    let fadeEls = []; // { el, left, width, shell, lens } with left measured from the track's left edge
    const lenses = new Map(); // element -> createGlass controller
    let rafId = null;
    let resizeObserver = null;

    const update = () => {
        const outer = outerRef.value;
        if (!outer) return;
        const rect = outer.getBoundingClientRect();
        const travelled = Math.min(Math.max(-rect.top, 0), distance);
        translate.value = travelled;
        progress.value = distance > 0 ? travelled / distance : 1;
        fadeEdges(travelled);
        onUpdate?.(travelled, rect);
    };

    const fadeEdges = (travelled) => {
        for (const f of fadeEls) {
            const x = f.left - travelled; // element's left edge in viewport coordinates
            if (f.shell) {
                if (!curving) {
                    // flat: fade only
                    let o = f.width < EDGE * 2
                        ? Math.min(x + f.width / 2, viewportWidth - x - f.width / 2) / EDGE
                        : (Math.min(x + f.width, viewportWidth) - Math.max(x, 0)) / Math.min(f.width, SHELL_FADE);
                    o = Math.min(1, Math.max(0, o));
                    if (focus && viewportWidth > focus) {
                        // how much of it is outside the in-focus column (0..1), eased
                        const colL = (viewportWidth - focus) / 2;
                        const colR = colL + focus;
                        const out = (Math.max(0, colL - x) + Math.max(0, x + f.width - colR)) / f.width;
                        let k = Math.min(1, Math.max(0, (out - 0.08) / 0.8));
                        k = k * k * (3 - 2 * k);
                        o *= 1 - 0.7 * k;
                        f.el.style.setProperty('--edge-blur', `${(k * 4).toFixed(2)}px`);
                        f.el.style.setProperty('--edge-s', (1 - 0.06 * k).toFixed(4));
                        f.el.style.setProperty('--edge-origin', x + f.width / 2 < viewportWidth / 2 ? 'right center' : 'left center');
                    }
                    f.el.style.setProperty('--edge-o', o.toFixed(3));
                    continue;
                }
                // small things (emblems) fade by their centre's distance to the edge, cards by how much is left on screen
                const o = f.width < EDGE * 2
                    ? Math.min(x + f.width / 2, viewportWidth - x - f.width / 2) / EDGE
                    : (Math.min(x + f.width, viewportWidth) - Math.max(x, 0)) / Math.min(f.width, SHELL_FADE);
                f.el.style.setProperty('--edge-o', Math.min(1, Math.max(0, o)).toFixed(3));
                const { u, t } = edgeT(x, f.width);
                f.el.style.setProperty('--edge-s', (1 - (1 - E.minScale) * t).toFixed(4));
                f.el.style.setProperty('--edge-r', `${(Math.sign(u) * E.tilt * t).toFixed(2)}deg`);
                f.el.style.setProperty('--edge-origin', u < 0 ? 'right center' : 'left center');
                if (f.lens) {
                    const bend = Math.round(E.bend * t);
                    f.lens.update(bend > 0 ? { refraction: bend, hidden: false } : { hidden: true });
                }
                continue;
            }
            const fading = x < EDGE || x + f.width > viewportWidth - EDGE;
            f.el.classList.toggle('fading', fading);
            if (fading) {
                f.el.style.setProperty('--fade-l', `${-x}px`);
                f.el.style.setProperty('--fade-r', `${viewportWidth - x}px`);
            }
        }
    };

    let curving = curve();

    const measure = () => {
        const viewport = viewportRef.value;
        const track = trackRef.value;
        const sticky = stickyRef.value;
        if (!viewport || !track || !sticky) return;
        curving = curve();
        const custom = getDistance?.();
        distance = custom ?? Math.max(0, track.scrollWidth - viewport.clientWidth);
        viewportWidth = viewport.clientWidth;
        // Layout offsets inside the track. offsetLeft/offsetWidth ignore transforms, so neither the track's
        // translate nor the shells' own edge curve skews them.
        const layoutLeft = (el) => {
            let left = 0;
            let n = el;
            while (n && n !== track && n !== viewport) {
                left += n.offsetLeft;
                n = n.offsetParent;
            }
            return n === viewport ? left - track.offsetLeft : left;
        };
        const useLens = lensAllowed.value && curving;
        const seen = new Set();
        fadeEls = [...track.querySelectorAll('.edge-fade, .edge-shell')].map((el) => {
            const shell = el.classList.contains('edge-shell');
            if (shell && !curving) ['--edge-s', '--edge-r', '--edge-origin', '--edge-blur'].forEach((k) => el.style.removeProperty(k));
            let lens = null;
            // cards only: emblems are too small to show a curve
            if (useLens && shell && el.offsetWidth >= EDGE * 2) {
                lens = lenses.get(el);
                if (!lens) lenses.set(el, (lens = makeLens(el)));
                else lens.update({ radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 });
                seen.add(el);
            }
            return { el, left: layoutLeft(el), width: el.offsetWidth, shell, lens };
        });
        for (const [el, lens] of lenses) {
            if (!seen.has(el)) {
                lens.destroy();
                lenses.delete(el);
            }
        }
        // Vertical room needed = the panel itself + one pixel of scroll per pixel of horizontal travel
        outerHeight.value = sticky.offsetHeight + distance;
        update();
    };

    const onScroll = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            update();
        });
    };

    /** Scroll the page so the track sits at fraction f (0..1) of its travel. */
    const seek = (f, immediate = false) => {
        if (!outerRef.value) return;
        const top = outerRef.value.getBoundingClientRect().top + window.scrollY + f * distance;
        lenis.scrollTo(top, immediate ? { immediate: true } : { duration: 1.1 });
    };

    // Graphics settings can switch refraction on / off, the scroll style can switch the curve; a theme
    // switch can change the cards' corner radius
    const stopLensWatch = watch([lensAllowed, curve], () => measure());
    // The section can swap its markup (ribbon <-> track): follow the new elements
    const stopTrackWatch = watch(trackRef, (el, old) => {
        if (old) resizeObserver?.unobserve(old);
        if (el) resizeObserver?.observe(el);
        measure();
    }, { flush: 'post' });
    let themeObserver = null;

    onMounted(async () => {
        await nextTick();
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', measure);
        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(trackRef.value);
        }
        // Fonts/images can change sizes after first paint
        window.addEventListener('load', measure);
        themeObserver = new MutationObserver(() => requestAnimationFrame(measure));
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-look', 'data-theme'] });
    });

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', measure);
        window.removeEventListener('load', measure);
        if (resizeObserver) resizeObserver.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        themeObserver?.disconnect();
        stopLensWatch();
        stopTrackWatch();
        for (const lens of lenses.values()) lens.destroy();
        lenses.clear();
    });

    return { outerRef, stickyRef, viewportRef, trackRef, outerHeight, translate, progress, seek, measure };
}
