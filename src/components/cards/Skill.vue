<template>
  <div class="skill" data-aos="flip-up" data-aos-offset="100">
    <div class="orb" ref="orbRef" :class="{ real: realGlass }">
      <img :src="image" :alt="name" :class="{ 'white-logo': WHITE_LOGOS.includes(name) }">
    </div>
    <p data-aos="zoom-in-up" data-aos-offset="100" data-aos-duration="1000">{{ name }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createGlass } from '../../vendor/liquidglass/liquid-glass.js';
import { gfx, canRefract } from '../../core/gfx';

// Graphics "Quality" only, on desktop Chromium: a real liquid-glass lens bending the 3D background.
// Everything else (Performance / Optimal / Advanced, phones, Safari, Firefox) keeps the faked glass below.
const orbRef = ref(null);
const realGlass = computed(() => canRefract && !gfx.advanced && gfx.level === 'quality');
let glass = null;
const setGlass = (on) => {
  if (on && !glass && orbRef.value) {
    glass = createGlass(orbRef.value, {
      mode: 'backdrop',
      fit: true,
      radius: 999, // clamped to a circle
      refraction: 18,
      bezel: 0.55,
      curvature: 3,
      chroma: 0.12,
      blur: 0,
      specular: 0.6,
      specularWidth: 1.5,
      fallback: 'blur(6px) saturate(1.6)',
    });
  } else if (!on && glass) {
    glass.destroy();
    glass = null;
  }
};
onMounted(() => setGlass(realGlass.value));
watch(realGlass, setGlass);
onBeforeUnmount(() => setGlass(false));

// Logos drawn in white: darkened in light mode so they stay visible on the glass
const WHITE_LOGOS = ['Next.js', 'Unity'];
defineProps(
  {
    image: String,
    name: String,
    isEven: Boolean,
  }
)
</script>
<style scoped>
.skill {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: var(--S);
  transition: 0.1s all ease;
  margin: 20px;
  gap: 10px;
  width: 100px;
}

/* Glass circle around each logo.
   Faked with gradients only (no backdrop-filter / SVG lens): ~40 of these sit over the animated 3D
   background, and real glass on each one made this section lag. */
.orb {
  position: relative;
  display: grid;
  place-items: center;
  width: 84px;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(120% 90% at 30% 15%, color-mix(in srgb, color-mix(in srgb, var(--accent, white) 35%, white) 26%, transparent), transparent 55%),
    radial-gradient(100% 100% at 50% 110%, color-mix(in srgb, var(--accent, white) 18%, transparent), transparent 60%),
    color-mix(in srgb, var(--gray-dark) 55%, transparent);
  border: 1px solid color-mix(in srgb, white 18%, transparent);
  box-shadow:
    inset 0 1px 1px color-mix(in srgb, white 45%, transparent),
    inset 0 -8px 16px color-mix(in srgb, var(--dark) 35%, transparent),
    0 8px 20px rgba(0, 0, 0, 0.22);
  transition: transform 0.4s cubic-bezier(0.34, 1.5, 0.5, 1), border-color 0.2s ease, box-shadow 0.2s ease !important;
}

/* Glare on the rim: two bright arcs (top-left and bottom-right) masked to a thin ring, in the theme's
   accent colour (a little lightened so it still reads as a highlight) */
.orb::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  pointer-events: none;
  background: conic-gradient(from 200deg,
      transparent 0deg,
      color-mix(in srgb, color-mix(in srgb, var(--accent, white) 70%, white) 90%, transparent) 40deg,
      transparent 95deg,
      transparent 200deg,
      color-mix(in srgb, var(--accent, white) 60%, transparent) 230deg,
      transparent 270deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px));
  transition: rotate 0.6s cubic-bezier(0.34, 1.5, 0.5, 1) !important;
}

.skill:hover .orb {
  transform: translateY(-5px) scale(1.05);
  border-color: color-mix(in srgb, var(--accent, white) 60%, transparent);
  box-shadow:
    inset 0 1px 1px color-mix(in srgb, white 45%, transparent),
    0 0 0 4px color-mix(in srgb, var(--accent, white) 12%, transparent),
    0 10px 24px rgba(0, 0, 0, 0.25);
}

.skill:hover .orb::after {
  rotate: 40deg;
}

/* Real lens: clear tint (the lens does the work) and no scale on hover, which would misalign it */
.orb.real {
  background:
    radial-gradient(120% 90% at 30% 15%, color-mix(in srgb, white 14%, transparent), transparent 55%),
    color-mix(in srgb, var(--light) 4%, transparent);
  border-color: color-mix(in srgb, white 22%, transparent);
  box-shadow: inset 0 1px 1px color-mix(in srgb, white 40%, transparent), 0 8px 20px rgba(0, 0, 0, 0.2);
}

.skill:hover .orb.real {
  transform: translateY(-5px);
}

img {
  width: 56%;
  aspect-ratio: 1/1;
  object-fit: contain;
}

p {
  color: var(--light);
  font-size: var(--S);
  font-family: var(--poppins);
  text-align: center;
}

/* @media screen and (max-width: 968px){
    img{
        width: 120px;
        height: 120px;
    }
} */

:root[data-theme="light"] .white-logo {
  filter: invert(1);
}

@media screen and (max-width: 638px) {
  .skill {
    margin: 0px;
  }

  .orb {
    width: 64px;
  }

  p {
    font-size: var(--XS);
  }
}
</style>