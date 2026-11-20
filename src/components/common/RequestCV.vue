<template>
    <div class="request-cv">
        <button class="button" type="button" :aria-expanded="open" aria-controls="cv-bubble" @click="toggle">
            <p class="text">{{ open ? $t('cv.close') : $t('cv.request') }}</p>
            <div class="svg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16">
                    <path
                        d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                </svg>
            </div>
        </button>

        <!-- Tooltip-style bubble with a pointer up to the button -->
        <div id="cv-bubble" class="panel" :class="{ open }">
            <div class="bubble">
                <form v-if="status !== 'sent'" class="cv-form" @submit.prevent="submit" novalidate>
                    <p class="cv-label">{{ $t('cv.prompt') }}</p>
                    <div class="cv-row">
                        <input ref="inputRef" v-model.trim="email" type="email" name="email"
                            :placeholder="$t('cv.placeholder')" autocomplete="email"
                            :disabled="status === 'sending'" required :aria-label="$t('cv.ariaEmail')">
                        <!-- honeypot for bots -->
                        <input v-model="company" type="text" name="company" class="hp" tabindex="-1"
                            autocomplete="off" aria-hidden="true">
                        <button type="submit" class="cv-send" :class="{ sending: status === 'sending' }"
                            :disabled="status === 'sending'">
                            <div class="svg-wrapper-1">
                                <div class="svg-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                                        aria-hidden="true">
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path fill="currentColor"
                                            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                            <span>{{ status === 'sending' ? $t('cv.sending') : $t('cv.send') }}</span>
                        </button>
                    </div>
                    <p v-if="error" class="cv-error" role="alert">{{ error }}</p>
                </form>
                <i18n-t v-else keypath="cv.success" tag="p" class="cv-success" role="status">
                    <template #email><strong>{{ sentTo }}</strong></template>
                </i18n-t>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { prefs, theme } from '../../core/prefs';
import { findLook } from '../../themes';

const { t, locale } = useI18n();

// the theme the visitor is on, so the confirmation email matches it (src/api/cv-email.js)
const themePayload = () => {
    const look = findLook(prefs.look);
    const mode = theme.value === 'light' ? 'light' : 'dark';
    return { name: look.name, km: look.km, mode, sw: look.sw?.[mode], fonts: look.fonts, kmFonts: look.kmFonts };
};

const open = ref(false);
const email = ref('');
const company = ref('');
const status = ref('idle'); // idle | sending | sent
const error = ref('');
const sentTo = ref('');
const inputRef = ref(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const toggle = async () => {
    open.value = !open.value;
    if (open.value && status.value !== 'sent') {
        await nextTick();
        inputRef.value?.focus({ preventScroll: true });
    }
};

const submit = async () => {
    error.value = '';
    if (!EMAIL_RE.test(email.value)) {
        error.value = t('cv.invalid');
        return;
    }
    status.value = 'sending';
    try {
        const res = await fetch('/api/request-cv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value, company: company.value, lang: locale.value, theme: themePayload() }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 400) throw new Error(t('cv.invalid'));
        if (!res.ok || !data.ok) throw new Error(res.status === 429 && data.error ? data.error : t('cv.error'));
        sentTo.value = email.value;
        status.value = 'sent';
        email.value = '';
    } catch (e) {
        status.value = 'idle';
        error.value = e.message;
    }
};
</script>

<style scoped>
.request-cv {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: var(--poppins);
}

.button {
    position: relative;
    width: 15.5rem;
    height: 3.2rem;
    border-radius: 60px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    cursor: pointer;
    transition: 0.4s ease-in-out;
    font-family: var(--poppins);
}

.button .text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    color: var(--light);
    font-size: var(--S);
    transition: 0.4s ease-in-out;
    cursor: pointer;
}

.button .svg {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-40px) rotate(30deg);
    opacity: 0;
    transition: 0.4s ease-in-out;
    cursor: pointer;
}

.button .svg svg {
    width: 1.6rem;
    height: 1.6rem;
    cursor: pointer;
}

.button:hover {
    background-color: rgb(50, 50, 50);
}

.button:hover .svg {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
}

.button:hover .text {
    opacity: 0;
}

.button:active {
    scale: 0.97;
}

/* Floats under the button so opening it never shifts the surrounding layout */
.panel {
    position: absolute;
    top: 100%;
    left: 50%;
    z-index: 5;
    width: min(420px, calc(100vw - 32px));
    padding-top: 14px;
    transform: translate(-50%, -6px) scale(0.98);
    transform-origin: top center;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0s linear 0.25s !important;
}

.panel.open {
    transform: translate(-50%, 0) scale(1);
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0s !important;
}

/* The tooltip box */
.bubble {
    position: relative;
    padding: 14px;
    border-radius: 18px;
    background: rgba(24, 24, 24, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

/* Pointy end: a rotated square sharing the box's fill and border */
.bubble::before {
    content: "";
    position: absolute;
    top: -8px;
    left: 50%;
    width: 14px;
    height: 14px;
    transform: translateX(-50%) rotate(45deg);
    background: inherit;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-top-left-radius: 3px;
    backdrop-filter: none;
}

[data-theme="light"] .bubble {
    background: rgba(255, 255, 255, 0.75);
    border-color: rgba(0, 0, 0, 0.12);
}

[data-theme="light"] .bubble::before {
    border-color: rgba(0, 0, 0, 0.12);
}

.cv-label {
    margin: 0 0 10px !important;
    font-size: var(--XS) !important;
    color: var(--gray-light);
    text-align: center;
}

.cv-row {
    display: flex;
    gap: 8px;
    padding: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

.cv-row:focus-within {
    border-color: var(--accent, rgba(255, 255, 255, 0.5));
}

.cv-row input[type="email"] {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--light);
    font-family: var(--poppins);
    font-size: var(--XS);
    padding: 0 12px;
    cursor: text;
}

.cv-row input::placeholder {
    color: var(--gray-light);
}

.hp {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
}

/* Send button: same paper-plane hover animation as the contact form */
.cv-send {
    font-family: inherit;
    font-size: var(--XS);
    font-weight: 600;
    background: var(--light);
    color: var(--dark);
    border: none;
    padding: 0.55em 1.1em 0.55em 0.9em;
    display: flex;
    align-items: center;
    border-radius: 60px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease !important;
}

.cv-send span {
    display: block;
    margin-left: 0.35em;
    transition: transform 0.3s ease-in-out !important;
    cursor: pointer;
}

.cv-send svg {
    display: block;
    transform-origin: center center;
    transition: transform 0.3s ease-in-out !important;
    cursor: pointer;
}

.svg-wrapper,
.svg-wrapper-1 {
    cursor: pointer;
}

.cv-send:hover .svg-wrapper,
.cv-send.sending .svg-wrapper {
    animation: fly-1 0.6s ease-in-out infinite alternate;
}

.cv-send:hover svg,
.cv-send.sending svg {
    transform: translateX(1.4em) rotate(45deg) scale(1.1);
}

.cv-send:hover span,
.cv-send.sending span {
    transform: translateX(6em);
}

.cv-send:active {
    transform: scale(0.95);
}

.cv-send:disabled {
    cursor: progress;
}

@keyframes fly-1 {
    from {
        transform: translateY(0.1em);
    }

    to {
        transform: translateY(-0.1em);
    }
}

.cv-error {
    margin: 8px 0 0 !important;
    font-size: var(--XS) !important;
    color: #ff7b7b;
    text-align: center;
}

.cv-success {
    margin: 0 !important;
    font-size: var(--XS) !important;
    color: var(--light);
    text-align: center;
}

@media screen and (max-width: 398px) {
    .button {
        width: 13rem;
    }

    .button .text {
        font-size: var(--XS);
    }
}
</style>
