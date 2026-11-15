<template>
    <!-- One group of tech: header + a fixed 3×3 grid, so every group is the same size whatever its
         item count (used by every Skills scroll style, including each strip of the 3D ribbon) -->
    <div class="skill-group">
        <header class="group-head">
            <span class="group-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <h3 class="group-title">{{ $t(`skills.groups.${group.key}`) }}</h3>
        </header>
        <div class="group-grid">
            <Skill v-for="skill in group.items" :key="skill.name" :image="skill.image" :name="skill.name" />
        </div>
    </div>
</template>

<script setup>
import Skill from './Skill.vue';

defineProps({
    group: { type: Object, required: true }, // { key, items: [{ name, image }] } from src/data/skills.js
    index: { type: Number, required: true },
});
</script>

<style scoped>
/* Sizes scale with the viewport between phone and desktop, so a group always fits one screen */
.skill-group {
    --col: clamp(84px, 9vw, 124px);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 2vw, 22px);
}

.group-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid color-mix(in srgb, white 12%, transparent);
}

.group-index {
    font-size: clamp(0.8rem, 1.2vw, 1.05rem);
    color: var(--accent, var(--light));
    font-variant-numeric: tabular-nums;
}

.group-title {
    margin: 0;
    font-size: clamp(1.05rem, 1.7vw, 1.55rem);
    font-weight: 500;
    white-space: nowrap;
}

/* Fixed 3 columns × up to 3 rows, filled left to right (most-used tech first), centred */
.group-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, var(--col));
    grid-template-rows: repeat(3, auto);
    gap: clamp(12px, 1.6vw, 20px) clamp(6px, 1vw, 14px);
    justify-content: center;
    justify-items: center;
    align-content: center;
}

.skill-group .group-grid :deep(.skill) {
    margin: 0;
    width: var(--col);
    gap: 8px;
}

/* bigger glass orb + logo + label, all from the column width */
.group-grid :deep(.skill .orb) {
    width: calc(var(--col) * 0.84);
}

.group-grid :deep(.skill p) {
    font-size: clamp(0.78rem, 1.1vw, 1.05rem);
    line-height: 1.25;
}

@media screen and (max-width: 768px) {
    .skill-group {
        --col: clamp(72px, 25vw, 96px);
    }
}
</style>
