<template>
    <!-- The whole card (list row or grid tile) opens the project in the full-screen viewer: cover + details,
         then the screenshots. No expand-in-place. -->
    <div class="project-card" :class="{ grid }" ref="cardRef" data-aos="zoom-in-down" role="button" tabindex="0"
        :aria-label="project.title" @click="openTile" @keydown.enter.self="openTile"
        @keydown.space.self.prevent="openTile">
        <div v-if="grid && cover" class="grid-cover">
            <img ref="coverRef" :src="cover" alt="" loading="lazy" decoding="async" class="grid-cover-img">
            <span class="grid-num">{{ displayNumber ?? project.number }}</span>
        </div>
        <div class="top">
            <div class="text-wrapper">
                <div class="num" ref="numRef">
                    <p>{{ displayNumber ?? project.number }}</p>
                </div>
                <div class="desc" ref="descRef">
                    <p class="title">{{ project.title }}</p>
                    <div class="tech-stack">
                        <div class="stack-item" v-for="item in project.techStack" :key="item">
                            <p>{{ item }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="project-img-year ">
                <div class="project-img-link">
                    <img v-if="project.mainImage" :src="project.mainImage" alt="" ref="projectImageRef" loading="lazy" decoding="async"
                        :class="['project-image', { 'project-image-vertical': project.isVertical }]">
                </div>
                <p class="year">{{ project.year }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { openProject } from '../../core/lightbox';

const props = defineProps({
    project: Object,
    displayNumber: Number,
    grid: Boolean, // grid view tile (Projects.vue list / grid switch)
});
const cover = computed(() => props.project.mainImage || (Array.isArray(props.project.image) ? props.project.image[0] : null));
const numRef = ref(null);
const cardRef = ref(null);
const descRef = ref(null);
const projectImageRef = ref(null);
const coverRef = ref(null);

// the viewer pours out of the picture the visitor sees: the grid cover, the list row's hover preview,
// or else the card itself
const openTile = () => {
    const img = props.grid ? coverRef.value : projectImageRef.value;
    const visible = img && getComputedStyle(img).visibility !== 'hidden' && img.offsetWidth > 0;
    openProject(props.project, visible ? img : cardRef.value);
};

// The thumbnails take the card's look (src/themes): the same corners, made concentric (the card's radius
// less its padding, so the gap between the two curves stays even), and the same border colour / weight.
// Read from the computed style, so every theme (and glass on / off) is matched without per-theme rules.
const syncShape = () => {
    const card = cardRef.value;
    if (!card) return;
    const cs = getComputedStyle(card);
    const pad = parseFloat(cs.paddingTop) || 0;
    const corner = (v) => {
        const r = parseFloat(v) || 0;
        return `${Math.round(Math.max(r - pad, r * 0.45))}px`;
    };
    card.style.setProperty('--thumb-r',
        [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(corner).join(' '));
    // the side border: some themes put a heavier accent rule on top / bottom only
    card.style.setProperty('--thumb-bw', `${Math.min(3, parseFloat(cs.borderRightWidth) || 0)}px`);
    card.style.setProperty('--thumb-bc', cs.borderRightColor);
};
let themeObserver = null;
onBeforeUnmount(() => themeObserver?.disconnect());

onMounted(() => {
    syncShape();
    themeObserver = new MutationObserver(() => requestAnimationFrame(syncShape));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-look', 'data-theme', 'data-glass'] });

    const card = cardRef.value;
    const num = numRef.value;
    const desc = descRef.value;
    if (!card || !num) return;

    // the light that follows the pointer (::before)
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

    // list view: the number slides away on hover (the cover is always shown, brightening on hover in CSS)
    const showNum = () => {
        if (window.innerWidth <= 638) return;
        num.style.transform = 'translateX(0)';
        desc.style.transform = 'translateX(0)';
        num.classList.remove('hidden');
    };
    const hideNum = () => {
        if (window.innerWidth <= 638 || props.grid) return;
        const gap = parseInt(getComputedStyle(card.querySelector('.text-wrapper')).gap) || 5;
        num.style.transform = 'translateX(-100%)';
        desc.style.transform = `translateX(${-(num.offsetWidth + gap) + 10}px)`;
        num.classList.add('hidden');
    };
    card.addEventListener('mouseenter', hideNum);
    card.addEventListener('mouseleave', showNum);
});
</script>

<style scoped>
/* ---------- Grid view tile ---------- */
.project-card.grid {
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: nowrap;
    padding: 14px;
    gap: 14px;
    height: 100%;
}

.grid-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    /* the card's shape + border (--thumb-*, set by syncShape) */
    border-radius: var(--thumb-r, 12px);
    border: var(--thumb-bw, 1px) solid var(--thumb-bc, rgba(255, 255, 255, 0.2));
    flex: none;
}

.grid-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    cursor: zoom-in;
    transition: scale 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) !important;
}

.project-card.grid:hover .grid-cover-img {
    scale: 1.04;
}

.grid-num {
    position: absolute;
    left: 10px;
    top: 10px;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    font-size: var(--XS);
    color: var(--light);
    background: color-mix(in srgb, var(--dark) 55%, transparent);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    border: 1px solid color-mix(in srgb, white 18%, transparent);
    pointer-events: none;
}

.project-card.grid .top {
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 12px;
}

.project-card.grid .text-wrapper {
    max-width: none;
    flex: 1;
    min-width: 0;
}

/* the list view's hover slide (inline styles from the script) is off in the grid */
.project-card.grid :is(.num, .desc) {
    transform: none !important;
}

.project-card.grid .num,
.project-card.grid .project-img-link {
    display: none;
}

.project-card.grid .desc {
    gap: 12px;
}

.project-card.grid .title {
    font-size: var(--S);
    font-weight: 600;
    line-height: 1.35;
}

.project-card.grid .tech-stack {
    gap: 6px;
}

.project-card.grid .stack-item {
    padding: 3px 10px;
    font-size: var(--XXS);
}

.project-card.grid .project-img-year {
    max-width: none;
    margin-right: 0;
    flex: none;
}

.project-card.grid .year {
    font-size: var(--XS);
    color: var(--gray-light);
}

.project-card {
    cursor: pointer;
}

.project-card:focus-visible {
    outline: 2px solid var(--accent, white);
    outline-offset: 3px;
}

@media screen and (max-width: 638px) {
    .project-card.grid {
        padding: 10px;
        gap: 10px;
    }

    .project-card.grid .top {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .project-card.grid .desc {
        align-items: flex-start;
        gap: 8px;
    }

    .project-card.grid .title {
        text-align: left;
        font-size: var(--XS);
    }

    .project-card.grid .tech-stack {
        justify-content: flex-start;
        gap: 4px;
    }

    .project-card.grid .stack-item {
        padding: 2px 7px;
        font-size: 0.625rem;
    }

    .project-card.grid .year {
        font-size: var(--XXS);
    }
}

.project-card {
    border-radius: 0px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 20px;
    width: 100%;
    min-height: 20%;
    font-family: var(--poppins);
    color: var(--light);
    transition: all 0.5s;
    position: relative;
    gap: 20px;
    transition: max-width 0.3s ease;
}

.project-card:hover::before {
    opacity: 1;
    cursor: crosshair;
}


.project-card::before {
    background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1),
            transparent 40%);
    content: "";
    height: 100%;
    width: 100%;
    border-radius: inherit;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
    opacity: 0;
    transition: opacity 500ms;
}

.text-wrapper {
    display: flex;
    justify-content: start;
    align-items: start;
    gap: 20px;
    max-width: 40%;
}

.title {
    font-size: var(--M);
    width: 100%;
}

.tech-stack {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.desc {
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.5s;
}

.stack-item {
    font-size: var(--XS);
    border-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 5px 12px;
    transition: all 0.3s ease-in-out;
}

.stack-item p {
    margin: 0;
}

.stack-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.project-img-year {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    max-width: 50%;
    margin-right: 20px;
}

.project-image {
    width: 65%;
    aspect-ratio: 16/10;
    border-radius: var(--thumb-r, 0);
    border: var(--thumb-bw, 1px) solid var(--thumb-bc, rgba(255, 255, 255, 0.2));
    /* always shown in the list; hovering the row brightens it and scales it up a little */
    opacity: 0.7;
    transition: opacity 0.3s ease-in-out, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    object-fit: cover;
}

.project-card:hover .project-image {
    opacity: 0.95;
    transform: scale(1.05);
}

.project-image-vertical {
    aspect-ratio: 9/17;
    /* Maintain same height as landscape: landscape height = 55% * 9/16, vertical width = (55% * 9/16) / (16/9) */
    width: calc(65% * 81 / 256);
}

.project-card .project-image:hover {
    opacity: 1;
}

.num {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 40px;
    height: 40px;
    position: relative;
    transition: transform 0.3s ease;
}

.num p {
    margin-bottom: 9px;
    color: var(--gray-light);
    font-size: var(--S);
    visibility: visible;
    transition: opacity 0.3s ease;
}

.num.hidden p {
    opacity: 0;
}

.project-img-link {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
}


@media screen and (max-width: 1000px) {

    .text-wrapper {
        max-width: 60%;
    }

    .project-img-link img {
        display: none;
    }

    /* .num {
        opacity: 0;
    } */
}

@media screen and (max-width: 638px) {
    .top {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .tech-stack {
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .text-wrapper {
        max-width: 100%;
        gap: 0;
    }

    .title {
        font-size: var(--M);
    }

    .desc {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .num {
        display: none;
    }

    .title {
        text-align: center;
    }

    .project-img-year {
        gap: 0;
        margin-right: 0px;
    }
}
</style>
