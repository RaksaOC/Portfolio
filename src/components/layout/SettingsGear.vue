<template>
    <button type="button" class="settings-gear" :aria-label="$t('settings.open')" :title="$t('settings.title')"
        :aria-expanded="ui.settingsOpen" aria-controls="settings-overlay" @click="ui.settingsOpen = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path
                d="M10.3 3.2h3.4l.5 2.4c.6.2 1.1.5 1.6.9l2.3-.8 1.7 2.9-1.8 1.6c.1.6.1 1.2 0 1.8l1.8 1.6-1.7 2.9-2.3-.8c-.5.4-1 .7-1.6.9l-.5 2.4h-3.4l-.5-2.4c-.6-.2-1.1-.5-1.6-.9l-2.3.8-1.7-2.9 1.8-1.6a5.6 5.6 0 0 1 0-1.8L4.3 8.6 6 5.7l2.3.8c.5-.4 1-.7 1.6-.9z" />
            <circle cx="12" cy="12" r="2.8" />
        </svg>
    </button>
</template>

<script setup>
import { ui } from '../../core/prefs';
</script>

<style scoped>
.settings-gear {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--light);
    cursor: pointer;
}

.settings-gear svg {
    width: 22px;
    height: 22px;
    cursor: pointer;
}

.settings-gear:hover svg,
.settings-gear:focus-visible svg {
    animation: gear-spin 1.6s linear infinite;
}

.settings-gear:hover {
    color: var(--accent, var(--light));
}

@keyframes gear-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {

    .settings-gear:hover svg,
    .settings-gear:focus-visible svg {
        animation: none;
        transform: rotate(45deg);
    }
}
</style>
