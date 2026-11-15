// Pinned horizontal scroll, shared by the Experience timeline and the Skills groups.
//
// Markup: outer (tall, height = outerHeight) > sticky (100vh, position: sticky) > viewport > track.
// While the outer element is on screen the sticky panel stays put and vertical scrolling is turned
// into horizontal movement of the track. Once the end is reached, normal vertical scrolling resumes.
//
// Edge fade where the track meets the viewport's left / right edges (styles in src/styles/global.css):
//  - "edge-fade": a gradient mask lined up with the viewport edges, for card contents and plain lines.
//  - "edge-shell": glass surfaces. Chrome ignores a mask on an element with backdrop-filter, so these
//    fade through --edge-o (opacity, which each section applies itself since it also drives the reveal),
//    and with a focus column also soften and shrink a little (--edge-blur / --edge-s / --edge-origin).
// Nothing is masked at the viewport level: that would make it a "backdrop root", and the glass cards
// inside could no longer bend the 3D background behind them.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { lenis } from './lenis';

// fade width in px (set as --edge on the faded elements): narrow on phones, where cards nearly fill the screen
const edgeFor = (viewportWidth) => (viewportWidth < 700 ? 20 : 72);
const EDGE_MIN_SHELL = 144; // shells narrower than this (emblems) fade by their centre
const SHELL_FADE = 160; // a glass shell is fully faded out once less than this much of it is on screen

/**
 * @param {object} [opts]
 * @param {(travelled: number, rect: DOMRect) => void} [opts.onUpdate] runs after every scroll update
 * @param {() => number | null} [opts.getDistance] scroll distance to use instead of the track's overflow
 *   (the Skills ribbon rotates instead of sliding); null falls back to the overflow
 * @param {number} [opts.focus] width (px) of a centred in-focus column. Shells partly outside
 *   it turn ghostly and soft (--edge-o lower, --edge-blur for their content, a touch smaller) by how much of
 *   them is outside, for a track that runs wider than the page column
 */
export function usePinnedScroll({ onUpdate, getDistance, focus = 0 } = {}) {
    const outerRef = ref(null);
    const stickyRef = ref(null);
    const viewportRef = ref(null);
    const trackRef = ref(null);

    const outerHeight = ref(0);
    const translate = ref(0);
    const progress = ref(0);

    let distance = 0; // horizontal distance the track has to travel
    let viewportWidth = 0;
    let fadeEls = []; // { el, left, width, shell } with left measured from the track's left edge
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
        const EDGE = edgeFor(viewportWidth);
        for (const f of fadeEls) {
            const x = f.left - travelled; // element's left edge in viewport coordinates
            if (f.shell) {
                // small things (emblems) fade by their centre's distance to the edge, cards by how much is left on screen
                let o = f.width < EDGE_MIN_SHELL
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
            const fading = x < EDGE || x + f.width > viewportWidth - EDGE;
            f.el.classList.toggle('fading', fading);
            if (fading) {
                f.el.style.setProperty('--edge', `${EDGE}px`);
                f.el.style.setProperty('--fade-l', `${-x}px`);
                f.el.style.setProperty('--fade-r', `${viewportWidth - x}px`);
            }
        }
    };

    const measure = () => {
        const viewport = viewportRef.value;
        const track = trackRef.value;
        const sticky = stickyRef.value;
        if (!viewport || !track || !sticky) return;
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
        fadeEls = [...track.querySelectorAll('.edge-fade, .edge-shell')].map((el) => ({
            el,
            left: layoutLeft(el),
            width: el.offsetWidth,
            shell: el.classList.contains('edge-shell'),
        }));
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
        stopTrackWatch();
    });

    return { outerRef, stickyRef, viewportRef, trackRef, outerHeight, translate, progress, seek, measure };
}
