<template>
    <!--
        AI assistant (state + streaming client in src/core/chat/chat.js, answers from src/api/chat.js / demo answers).
        Opened from the "Raksa AI" button: desktop, the bottom-right corner dock (CornerDock.vue); phones, a pill
        left of the menu button (MobileNavBar.vue).
        Three layouts, chosen from the header (remembered per visitor):
        - floating  a window you can drag by its header and resize from any edge / corner
        - overlay   a drawer on the right over a dimmed page (click outside to close)
        - dock      a side panel that pushes the page over; drag its left edge to resize
        Phones always get a bottom sheet instead: drag its grip / header up and it grows into full screen,
        down to shrink it back or dismiss it.
    -->

    <Transition name="chat-scrim">
        <div v-if="chat.open && (mode === 'overlay' || mode === 'sheet')" class="chat-scrim"
            :class="{ sheet: mode === 'sheet' }" :style="{ '--p': sheetP }" aria-hidden="true" @click="close"></div>
    </Transition>

    <Transition :name="`chat-${mode}`" @after-enter="focusInput">
        <section v-show="chat.open" ref="panelRef" class="chat-panel"
            :class="[`mode-${mode}`, { busy: moving, empty: !chat.messages.length && !chat.showHistory, 'sheet-full': mode === 'sheet' && sheetFull, settling: sheetSettling }]"
            :style="panelStyle" role="dialog" :aria-label="$t('chat.title')" @keydown.esc="close">

            <!-- phone sheet: the grip (also the header) drags it between half and full screen; a tap toggles -->
            <div v-if="mode === 'sheet'" class="sheet-grip" aria-hidden="true" @pointerdown="startSheetDrag"></div>
            <div v-if="mode === 'dock'" class="chat-dock-handle" :aria-label="$t('chat.resize')"
                @pointerdown="startDockResize"></div>
            <button v-if="mode === 'overlay' && !mobile" type="button" class="chat-edge-close"
                :aria-label="$t('chat.close')" @click="close">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>

            <header class="chat-head"
                :class="{ grab: mode === 'floating', 'has-history': chat.archive.length, 'history-on': chat.showHistory }"
                @pointerdown="startDrag">
                <!-- past chats: a little drip peeks out of the panel's edge when you hover the header; hover it and it
                     swells into a history button -->
                <button v-if="chat.archive.length" type="button" class="hist-nudge" :title="$t('chat.history')"
                    :aria-label="$t('chat.history')" :aria-pressed="chat.showHistory"
                    @click="chat.showHistory = !chat.showHistory">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.history" /></svg>
                </button>
                <div class="chat-head-text">
                    <h2>{{ $t('chat.title') }}</h2>
                    <p class="chat-sub" :class="{ on: chat.typing }">{{ chat.status || $t('chat.typing') }}</p>
                </div>
                <div class="chat-head-actions">
                    <button v-if="chat.messages.length" type="button" class="chat-icon-btn" :title="$t('chat.clear')"
                        :aria-label="$t('chat.clear')" @click="clearChat">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.newChat" /></svg>
                    </button>
                    <div v-if="!mobile" class="chat-mode">
                        <button type="button" class="chat-icon-btn" :title="$t('chat.mode')" :aria-label="$t('chat.mode')"
                            :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[chat.mode]" /></svg>
                        </button>
                        <Transition name="chat-menu">
                            <ul v-if="menuOpen" class="chat-menu" role="menu">
                                <li v-for="m in MODES" :key="m" role="none">
                                    <button type="button" role="menuitemradio" :aria-checked="chat.mode === m"
                                        :class="{ active: chat.mode === m }" @click="setMode(m)">
                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[m]" /></svg>
                                        {{ $t(`chat.modes.${m}`) }}
                                    </button>
                                </li>
                            </ul>
                        </Transition>
                    </div>
                    <button type="button" class="chat-icon-btn" :aria-label="$t('chat.close')" @click="close">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.close" /></svg>
                    </button>
                </div>
            </header>

            <div ref="listRef" class="chat-list" data-lenis-prevent @scroll.passive="onListScroll">
                <!-- history: pick a past conversation to reopen -->
                <div v-if="chat.showHistory" class="chat-history">
                    <div class="hist-top">
                        <button type="button" class="chat-icon-btn" :aria-label="$t('chat.historyBack')"
                            :title="$t('chat.historyBack')" @click="chat.showHistory = false">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                        </button>
                        <h3>{{ $t('chat.history') }}</h3>
                    </div>
                    <ul class="hist-list">
                        <li v-for="h in chat.archive" :key="h.id" class="hist-row">
                            <button type="button" class="hist-item" @click="openSession(h.id)">
                                <span class="hist-title">{{ h.title }}</span>
                                <span class="hist-meta">{{ ago(h.at) }} · {{ $t('chat.historyCount', { n: h.messages.length }) }}</span>
                            </button>
                            <button type="button" class="hist-del" :aria-label="$t('chat.historyDelete')"
                                :title="$t('chat.historyDelete')" @click="deleteSession(h.id)">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.close" /></svg>
                            </button>
                        </li>
                    </ul>
                </div>

                <template v-else>
                <div v-if="!chat.messages.length" class="chat-welcome">
                    <h3>{{ $t('chat.welcomeTitle') }}</h3>
                    <p>{{ $t('chat.welcomeBody') }}</p>
                </div>

                <!-- only the latest messages are rendered; scrolling to the top loads older ones -->
                <button v-if="hidden" type="button" class="chat-older" @click="loadOlder">
                    {{ $t('chat.older', { n: hidden }) }}
                </button>

                <div v-for="m in visible" :key="m.id" class="chat-msg" :class="m.role">
                    <div v-if="m.role === 'user'" class="chat-bubble">{{ m.text }}</div>
                    <div v-else-if="!m.text && m.streaming" class="chat-answer thinking">
                        <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
                        {{ chat.status || $t('chat.thinking') }}
                    </div>
                    <div v-else class="chat-answer chat-md" :class="{ streaming: m.streaming }"
                        v-html="renderMarkdown(m.text)"></div>
                    <span class="chat-time">
                        {{ time(m.at) }}<template v-if="m.stopped"> · {{ $t('chat.stopped') }}</template>
                    </span>
                </div>
                <p v-if="chat.typing && chat.status && lastBotHasText" class="chat-status-line">{{ chat.status }}</p>
                </template>
            </div>

            <footer class="chat-foot">
                <form class="chat-composer" @submit.prevent="submit">
                    <textarea ref="inputRef" v-model="draft" rows="1" maxlength="2000"
                        :placeholder="$t('chat.placeholder')" :aria-label="$t('chat.placeholder')"
                        @keydown.enter.exact.prevent="submit" @input="grow" @focus="onInputFocus"></textarea>
                    <button v-if="!chat.typing" type="submit" class="chat-send" :disabled="!draft.trim()"
                        :aria-label="$t('chat.send')">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.send" /></svg>
                    </button>
                    <button v-else type="button" class="chat-send stop" :aria-label="$t('chat.stop')" @click="stop">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
                    </button>
                </form>
                <!-- suggestions only on a fresh chat, under the input -->
                <div v-if="!chat.messages.length && !chat.showHistory" class="chat-chips">
                    <button v-for="q in faq" :key="q" type="button" class="chat-chip" :disabled="chat.typing"
                        @click="ask(q)">{{ q }}</button>
                </div>
            </footer>

            <template v-if="mode === 'floating'">
                <span v-for="h in HANDLES" :key="h" class="chat-rz" :class="`rz-${h}`" aria-hidden="true"
                    @pointerdown="startResize(h, $event)"></span>
            </template>
        </section>
    </Transition>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { chat, MODES, DOCK_MIN, DOCK_MAX, FLOAT_MIN, send, stop, clearChat, openSession, deleteSession } from '../../core/chat/chat';
import { renderMarkdown } from '../../core/chat/markdown';

const { t, tm, rt, locale } = useI18n();

const ICONS = {
    // four-point sparkle star, centred on 12,12
    star: 'M12 2.5C12.6 7.6 16.4 11.4 21.5 12 16.4 12.6 12.6 16.4 12 21.5 11.4 16.4 7.6 12.6 2.5 12 7.6 11.4 11.4 7.6 12 2.5z',
    close: 'M6 6l12 12M18 6L6 18',
    history: 'M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4M12 7.5V12l3 2',
    send: 'M4 12l16-8-6 16-2.5-6.5zM11.5 13.5L20 4',
    newChat: 'M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6M17.5 3.5l3 3L13 14l-3.5.5.5-3.5z',
    floating: 'M3 5h18v14H3zM12 12h7v5h-7z',
    overlay: 'M3 5h18v14H3zM14 5v14M16.5 9h2M16.5 12h2',
    dock: 'M3 5h18v14H3zM9 5v14M15 5v14',
};
const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

const panelRef = ref(null);
const listRef = ref(null);
const inputRef = ref(null);
const draft = ref('');
const menuOpen = ref(false);
const moving = ref(false); // dragging / resizing: no transitions

// phones / tablets: always the bottom sheet
const mq = typeof matchMedia === 'function' ? matchMedia('(max-width: 1000px)') : null;
const mobile = ref(!!mq?.matches);
const onMq = (e) => { mobile.value = e.matches; };
// the dock keeps at least PAGE_MIN px for the page; windows too narrow for that get the overlay instead
const PAGE_MIN = 700;
const vw = ref(innerWidth);
const mode = computed(() => {
    if (mobile.value) return 'sheet';
    if (chat.mode === 'dock' && vw.value < DOCK_MIN + PAGE_MIN) return 'overlay';
    return chat.mode;
});

watch(mode, (m) => { chat.view = m; }, { immediate: true });

const faq = computed(() => (tm('chat.faq') || []).map((q) => rt(q)));
const lastBotHasText = computed(() => {
    const last = chat.messages[chat.messages.length - 1];
    return last?.role === 'bot' && !!last.text;
});
// "5 minutes ago", "yesterday", in the site's language
const ago = (d) => {
    try {
        const rtf = new Intl.RelativeTimeFormat(locale.value === 'km' ? 'km' : 'en', { numeric: 'auto' });
        const s = (d.getTime() - Date.now()) / 1000;
        const steps = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month'], [Infinity, 'year']];
        let v = s;
        for (const [n, unit] of steps) {
            if (Math.abs(v) < n) return rtf.format(Math.round(v), unit);
            v /= n;
        }
    } catch { /* old browser */ }
    return d.toLocaleDateString();
};
const time = (d) => { try { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

/* ---------- open / close / mode ---------- */
const close = () => { chat.open = false; menuOpen.value = false; };
const focusInput = () => { if (!mobile.value) inputRef.value?.focus({ preventScroll: true }); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function setMode(m) {
    menuOpen.value = false;
    if (m === chat.mode) return;
    // into / out of the dock: close, switch, reopen, so the page and the panel animate cleanly
    if (chat.open && (m === 'dock' || chat.mode === 'dock')) {
        chat.open = false;
        await wait(340);
        chat.mode = m;
        await nextTick();
        chat.open = true;
    } else {
        chat.mode = m;
    }
}

/* ---------- messages ---------- */
const submit = () => {
    const text = draft.value;
    if (!text.trim() || chat.typing) return;
    draft.value = '';
    chat.showHistory = false;
    nextTick(grow);
    send(text, { locale: locale.value, errorText: t('chat.error') });
};
const ask = (q) => {
    chat.showHistory = false;
    send(q, { locale: locale.value, errorText: t('chat.error') });
};
const grow = () => {
    const el = inputRef.value;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
};
/* ---------- paging: render the last PAGE messages, load older ones from the top ---------- */
const PAGE = 20;
const shown = ref(PAGE);
const visible = computed(() => chat.messages.slice(Math.max(0, chat.messages.length - shown.value)));
const hidden = computed(() => Math.max(0, chat.messages.length - shown.value));
let loadingOlder = false;
function loadOlder() {
    const l = listRef.value;
    if (!hidden.value || loadingOlder || !l) return;
    loadingOlder = true;
    // keep what's on screen in place while older messages appear above it
    const fromBottom = l.scrollHeight - l.scrollTop;
    shown.value += PAGE;
    nextTick(() => {
        l.scrollTop = l.scrollHeight - fromBottom;
        loadingOlder = false;
    });
}
// only when the visitor scrolls up towards the top (not when the list is still at 0 before it's pinned to the bottom)
let lastTop = 0;
const onListScroll = () => {
    const l = listRef.value;
    if (!l) return;
    const up = l.scrollTop < lastTop;
    lastTop = l.scrollTop;
    if (up && l.scrollTop < 120) loadOlder();
};
// a new chat (or a cleared one) starts with one page again
watch(() => chat.messages.length, (n, o) => { if (!n || n < o) shown.value = PAGE; });
// closing the chat drops the older pages again, so it reopens light
watch(() => chat.open, (open) => { if (!open) shown.value = PAGE; });

// keep the newest message in view
const toBottom = () => nextTick(() => { const l = listRef.value; if (l) l.scrollTop = l.scrollHeight; });
watch(() => [chat.messages.length, chat.messages[chat.messages.length - 1]?.text, chat.status, chat.open], toBottom);

/* ---------- floating window: position, drag, resize ---------- */
const clampRect = (r) => {
    const vw = innerWidth;
    const vh = innerHeight;
    const width = Math.max(FLOAT_MIN.w, Math.min(r.width, vw - 16));
    const height = Math.max(FLOAT_MIN.h, Math.min(r.height, vh - 16));
    return {
        width, height,
        left: Math.max(8, Math.min(r.left, vw - width - 8)),
        top: Math.max(8, Math.min(r.top, vh - height - 8)),
    };
};
const defaultRect = () => clampRect({ width: 384, height: 560, left: innerWidth - 384 - 24, top: innerHeight - 560 - 118 });
const rect = ref(chat.float ? clampRect(chat.float) : defaultRect());
watch(rect, (r) => { chat.float = { ...r }; }, { deep: true });

const panelStyle = computed(() => {
    if (mode.value === 'floating') {
        const r = rect.value;
        return { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` };
    }
    if (mode.value === 'dock') return { width: `${chat.dockWidth}px` };
    if (mode.value === 'sheet') {
        return { top: `${sheetBase.value}px`, transform: sheetShift.value ? `translate3d(0, ${sheetShift.value}px, 0)` : null, '--p': sheetP.value };
    }
    return {};
});

function track(e, onMove, onUp) {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture?.(e.pointerId);
    moving.value = true;
    const move = (ev) => onMove(ev);
    const up = (ev) => {
        moving.value = false;
        onUp?.(ev);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
}

/* ---------- phone sheet: half screen ⇄ full screen, dragged by the grip / header ----------
   Smooth on phones: the layout only changes when the sheet settles. While the finger moves, the sheet just
   slides (a GPU transform; its glass runs on below the screen edge, so pulling it up never opens a gap).
   On release the new height is committed once and the sheet glides the rest of the way (FLIP). */
const SHEET = 0.64 // share of the screen the resting sheet covers
const sheetFull = ref(false);
const sheetShift = ref(0);       // px the sheet is slid from its laid-out position (finger / settle animation)
const sheetSettling = ref(false); // the shift is easing back to 0
const vh = ref(innerHeight);
const sheetRest = () => Math.round(vh.value * (1 - SHEET));
const sheetBase = computed(() => (sheetFull.value ? 0 : sheetRest())); // laid-out top edge
// 0 = resting sheet .. 1 = full screen, from where the sheet visibly is: corner radius, grip, scrim, header
const sheetP = computed(() => 1 - Math.min(1, Math.max(0, (sheetBase.value + sheetShift.value) / sheetRest())));
watch(() => chat.open, (open) => { if (open) { sheetFull.value = false; sheetShift.value = 0; } });

let settleTimer = 0;
function settleSheet(full) {
    const visual = sheetBase.value + sheetShift.value;
    sheetSettling.value = false;
    sheetFull.value = full;                       // commit the layout once…
    sheetShift.value = visual - sheetBase.value;  // …keep it visually where the finger left it…
    requestAnimationFrame(() => requestAnimationFrame(() => {
        sheetSettling.value = true;               // …then glide home
        sheetShift.value = 0;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => { sheetSettling.value = false; }, 520);
    }));
}

function startSheetDrag(e) {
    if (mode.value !== 'sheet' || (e.button ?? 0) !== 0) return;
    clearTimeout(settleTimer);
    sheetSettling.value = false;
    const startY = e.clientY;
    const startShift = sheetShift.value;
    const base = sheetBase.value;
    const wasFull = sheetFull.value;
    let last = { y: e.clientY, t: performance.now() };
    let v = 0; // px per ms, + = downward
    let frame = 0;
    let pending = startShift;
    track(e, (ev) => {
        const now = performance.now();
        v = v * 0.6 + ((ev.clientY - last.y) / Math.max(1, now - last.t)) * 0.4;
        last = { y: ev.clientY, t: now };
        // follows the finger; past full screen it resists (rubber band)
        const top = base + startShift + ev.clientY - startY;
        pending = (top < 0 ? top * 0.25 : Math.min(vh.value, top)) - base;
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; sheetShift.value = pending; });
    }, (ev) => {
        cancelAnimationFrame(frame);
        sheetShift.value = pending;
        const top = base + pending;
        if (Math.abs((ev?.clientY ?? startY) - startY) < 6) { settleSheet(!wasFull); return; } // tap toggles
        const rest = sheetRest();
        if (v < -0.45) return settleSheet(true);                    // flick up
        if (v > 0.45) return wasFull ? settleSheet(false) : close();  // flick down: one step down
        if (top < rest * 0.5) return settleSheet(true);
        if (top > rest + (vh.value - rest) * 0.35) return close();
        return settleSheet(false);
    });
}
// typing on a phone: the keyboard takes half the screen, so the sheet goes full screen to keep the chat visible
const onInputFocus = () => { if (mode.value === 'sheet') sheetFull.value = true; };

function startDrag(e) {
    if (mode.value === 'sheet' && !e.target.closest('button, a, input, textarea, .chat-menu')) { startSheetDrag(e); return; }
    if (mode.value !== 'floating' || e.button !== 0 || e.target.closest('button, a, input, textarea, .chat-menu')) return;
    const start = { x: e.clientX, y: e.clientY, ...rect.value };
    track(e, (ev) => {
        rect.value = clampRect({ ...start, left: start.left + ev.clientX - start.x, top: start.top + ev.clientY - start.y });
    });
}

function startResize(h, e) {
    if (e.button !== 0) return;
    const s = { x: e.clientX, y: e.clientY, ...rect.value };
    track(e, (ev) => {
        const dx = ev.clientX - s.x;
        const dy = ev.clientY - s.y;
        let { left, top, width, height } = s;
        if (h.includes('e')) width = s.width + dx;
        if (h.includes('s')) height = s.height + dy;
        if (h.includes('w')) { width = Math.max(FLOAT_MIN.w, s.width - dx); left = s.left + s.width - width; }
        if (h.includes('n')) { height = Math.max(FLOAT_MIN.h, s.height - dy); top = s.top + s.height - height; }
        rect.value = clampRect({ left, top, width, height });
    });
}

/* ---------- dock: push the page over, resizable from the left edge ---------- */
const dockMax = () => Math.max(DOCK_MIN, Math.min(DOCK_MAX, innerWidth - PAGE_MIN));
function startDockResize(e) {
    if (e.button !== 0) return;
    track(e, (ev) => {
        chat.dockWidth = Math.round(Math.max(DOCK_MIN, Math.min(dockMax(), innerWidth - ev.clientX)));
    });
}
let animTimer = 0;
const docked = computed(() => chat.open && mode.value === 'dock');
watch(docked, (on) => {
    const root = document.documentElement;
    root.classList.add('chat-dock-anim');
    clearTimeout(animTimer);
    animTimer = setTimeout(() => root.classList.remove('chat-dock-anim'), 420);
    root.classList.toggle('chat-docked', on);
}, { immediate: true });
watch(() => chat.dockWidth, (w) => document.documentElement.style.setProperty('--chat-dock', `${w}px`), { immediate: true });

/* ---------- misc ---------- */
const onResize = () => {
    vw.value = innerWidth;
    vh.value = innerHeight;
    rect.value = clampRect(rect.value);
    if (chat.dockWidth > dockMax()) chat.dockWidth = Math.max(DOCK_MIN, dockMax());
};
const onDocDown = (e) => { if (menuOpen.value && !e.target.closest('.chat-mode')) menuOpen.value = false; };
const onKey = (e) => { if (e.key === 'Escape' && chat.open && (mode.value === 'overlay' || mode.value === 'sheet')) close(); };

onMounted(() => {
    mq?.addEventListener?.('change', onMq);
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerdown', onDocDown, true);
    window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
    mq?.removeEventListener?.('change', onMq);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('pointerdown', onDocDown, true);
    window.removeEventListener('keydown', onKey);
    document.documentElement.classList.remove('chat-docked', 'chat-dock-anim');
});
</script>

<style scoped>
svg .fill {
    fill: currentColor;
    stroke: none;
}

/* ---------- panel ---------- */
.chat-scrim {
    position: fixed;
    inset: 0;
    z-index: 1499;
    background: rgba(0, 0, 0, 0.35);
}

.chat-panel {
    position: fixed;
    z-index: 1500;
    display: flex;
    flex-direction: column;
    /* visible: the history drop protrudes out of the left edge (the list scrolls inside its own box) */
    overflow: visible;
    color: var(--light);
    font-family: var(--poppins);
    /* glass: the page shows through (bent by the liquid-glass filter where supported), tinted just enough to read */
    background:
        linear-gradient(160deg, color-mix(in srgb, white 9%, transparent), transparent 38%),
        radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--accent, white) 10%, transparent), transparent 60%),
        color-mix(in srgb, var(--dark) 46%, transparent);
    -webkit-backdrop-filter: blur(16px) saturate(1.7);
    backdrop-filter: var(--lg-url, url(#liquid-glass)) blur(14px) saturate(1.7) brightness(1.04);
    border: 1px solid color-mix(in srgb, white 18%, transparent);
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 22%, transparent),
        inset 0 0 0 1px color-mix(in srgb, var(--accent, white) 10%, transparent),
        0 24px 60px rgba(0, 0, 0, 0.4);
}

.mode-floating {
    border-radius: 22px;
}

.mode-overlay,
.mode-dock {
    top: 0;
    right: 0;
    bottom: 0;
    border-radius: 22px 0 0 22px;
    border-right: 0;
}

.mode-overlay {
    width: min(100vw, 480px);
}

.busy,
.busy * {
    transition: none !important;
    user-select: none;
}

/* enter / leave per layout */
.chat-floating-enter-active {
    transition: opacity 0.25s ease, translate 0.45s cubic-bezier(0.34, 1.4, 0.5, 1), scale 0.45s cubic-bezier(0.34, 1.4, 0.5, 1) !important;
    transform-origin: 100% 100%;
}

.chat-floating-leave-active {
    transition: opacity 0.18s ease, translate 0.2s ease, scale 0.2s ease !important;
    transform-origin: 100% 100%;
}

.chat-floating-enter-from,
.chat-floating-leave-to {
    opacity: 0;
    translate: 0 14px;
    scale: 0.94;
}

.chat-overlay-enter-active,
.chat-overlay-leave-active,
.chat-dock-enter-active,
.chat-dock-leave-active {
    transition: translate 0.32s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.chat-overlay-enter-from,
.chat-overlay-leave-to,
.chat-dock-enter-from,
.chat-dock-leave-to {
    translate: 100% 0;
}

.chat-scrim-enter-active,
.chat-scrim-leave-active {
    transition: opacity 0.28s ease !important;
}

.chat-scrim-enter-from,
.chat-scrim-leave-to {
    opacity: 0;
}

/* side handles */
.chat-dock-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    z-index: 3;
    cursor: col-resize !important;
}

.chat-dock-handle::after {
    content: "";
    position: absolute;
    left: 2px;
    top: 50%;
    width: 3px;
    height: 44px;
    margin-top: -22px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--accent, white) 60%, transparent);
    opacity: 0.35;
    transition: opacity 0.2s ease, height 0.2s ease !important;
}

.chat-dock-handle:hover::after {
    opacity: 1;
    height: 80px;
    margin-top: -40px;
}

.chat-edge-close {
    position: absolute;
    left: -1px;
    top: 50%;
    z-index: 3;
    translate: -100% -50%;
    width: 26px;
    height: 64px;
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 12px 0 0 12px;
    border: 1px solid color-mix(in srgb, white 18%, transparent);
    border-right: 0;
    color: var(--light);
    background: color-mix(in srgb, var(--dark) 46%, transparent);
    -webkit-backdrop-filter: blur(14px) saturate(1.7);
    backdrop-filter: blur(14px) saturate(1.7);
    cursor: pointer;
}

.chat-edge-close svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
}

/* overlay drawer: its close tab sticks out of the panel, so the panel can't clip */
.mode-overlay {
    overflow: visible;
}

.mode-overlay .chat-list {
    border-radius: 0;
}

/* floating resize handles (edges 6px, corners 14px) */
.chat-rz {
    position: absolute;
    z-index: 4;
}

.rz-n,
.rz-s {
    left: 14px;
    right: 14px;
    height: 6px;
    cursor: ns-resize !important;
}

.rz-e,
.rz-w {
    top: 14px;
    bottom: 14px;
    width: 6px;
    cursor: ew-resize !important;
}

.rz-n { top: 0; }
.rz-s { bottom: 0; }
.rz-e { right: 0; }
.rz-w { left: 0; }

.rz-ne,
.rz-nw,
.rz-se,
.rz-sw {
    width: 14px;
    height: 14px;
}

.rz-ne { top: 0; right: 0; cursor: nesw-resize !important; }
.rz-sw { bottom: 0; left: 0; cursor: nesw-resize !important; }
.rz-nw { top: 0; left: 0; cursor: nwse-resize !important; }
.rz-se { bottom: 0; right: 0; cursor: nwse-resize !important; }

/* ---------- header ---------- */
.chat-head {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 14px 12px 16px;
    border-bottom: 1px solid color-mix(in srgb, var(--light) 10%, transparent);
    flex: none;
}

/* history drip: tucked behind the panel's left edge; hovering the header lets a drop of it protrude out of the
   edge, hovering the drop swells it (still outside the panel) into a round history button */
.hist-nudge {
    position: absolute;
    right: 100%;
    top: 50%;
    z-index: 5;
    width: 0;
    height: 16px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 999px 0 0 999px;
    color: var(--dark);
    background:
        radial-gradient(120% 90% at 70% 15%, color-mix(in srgb, white 35%, transparent), transparent 60%),
        var(--accent, var(--light));
    box-shadow: -4px 4px 14px color-mix(in srgb, var(--accent, white) 35%, transparent);
    overflow: hidden;
    translate: 0 -50%;
    cursor: pointer;
    transition: width 0.45s cubic-bezier(0.34, 1.5, 0.5, 1), height 0.45s cubic-bezier(0.34, 1.5, 0.5, 1),
        border-radius 0.35s ease !important;
}

.hist-nudge svg {
    width: 18px;
    height: 18px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    scale: 0.5;
    transition: opacity 0.2s ease, scale 0.35s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

/* peek: a little drop hanging out of the edge */
.chat-head:hover .hist-nudge {
    width: 11px;
    height: 24px;
}

/* swell into a fat drop outside the edge, with the icon (also while the history is open) */
.chat-head .hist-nudge:hover,
.hist-nudge:focus-visible,
.history-on .hist-nudge {
    width: 42px;
    height: 36px;
    padding-right: 4px;
}

.chat-head .hist-nudge:hover svg,
.hist-nudge:focus-visible svg,
.history-on .hist-nudge svg {
    opacity: 1;
    scale: 1;
}

/* touch screens can't hover, and the phone drawer fills the screen (nothing to protrude into): the round
   button sits just inside the edge and the title steps aside for it */
@media (hover: none) {
    .has-history .hist-nudge {
        right: auto;
        left: 0;
        width: 42px;
        height: 36px;
        padding: 0 0 0 4px;
        border-radius: 0 999px 999px 0;
    }

    .has-history .hist-nudge svg {
        opacity: 1;
        scale: 1;
    }

    .has-history .chat-head-text {
        translate: 32px 0;
    }
}

.chat-head-text {
    transition: translate 0.45s cubic-bezier(0.34, 1.5, 0.5, 1) !important;
}

/* ---------- history list ---------- */
.chat-history {
    display: grid;
    gap: 10px;
    animation: chat-fade 0.3s ease both;
}

.hist-top {
    display: flex;
    align-items: center;
    gap: 6px;
}

.hist-top h3 {
    margin: 0;
    font-family: var(--look-display, var(--poppins));
    font-size: var(--S);
    color: var(--light);
}

.hist-list {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
}

/* plain rows split by a hairline, no boxes */
.hist-row {
    position: relative;
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid color-mix(in srgb, var(--light) 12%, transparent);
}

.hist-row:last-child {
    border-bottom: 0;
}

.hist-row:hover .hist-title {
    color: var(--accent, var(--light));
}

.hist-item {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 2px;
    padding: 12px 6px 12px 2px;
    border: 0;
    background: transparent;
    color: var(--light);
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.hist-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--XS);
    font-weight: 500;
    transition: color 0.2s ease !important;
}

.hist-meta {
    font-size: var(--XXS);
    color: var(--gray-light);
}

.hist-del {
    flex: none;
    width: 36px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--gray-light);
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.2s ease, color 0.2s ease !important;
}

.hist-row:hover .hist-del,
.hist-del:focus-visible {
    opacity: 1;
}

.hist-del:hover {
    color: #ff6b6b;
}

.hist-del svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
}

@media (hover: none) {
    .hist-del { opacity: 0.7; }
}

.chat-head.grab {
    cursor: grab !important;
}

.busy .chat-head.grab {
    cursor: grabbing !important;
}


.chat-head-text {
    flex: 1;
    min-width: 0;
}

.chat-head h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-family: var(--look-display, var(--poppins));
    font-size: var(--S);
    font-weight: 600;
    line-height: 1.3;
    color: var(--light);
}


.chat-sub {
    margin: 0;
    height: 0;
    overflow: hidden;
    font-size: var(--XXS);
    color: var(--gray-light);
    opacity: 0;
    transition: opacity 0.2s ease, height 0.2s ease !important;
}

.chat-sub.on {
    height: 1.4em;
    opacity: 1;
}

.chat-head-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.chat-icon-btn {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    padding: 0;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--light);
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease !important;
}

.chat-icon-btn:hover,
.chat-icon-btn[aria-expanded="true"] {
    background: color-mix(in srgb, var(--light) 8%, transparent);
    border-color: color-mix(in srgb, var(--light) 16%, transparent);
}

.chat-icon-btn svg,
.chat-menu svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.chat-mode {
    position: relative;
}

.chat-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 5;
    min-width: 170px;
    margin: 0;
    padding: 6px;
    list-style: none;
    border-radius: 14px;
    background: color-mix(in srgb, var(--dark) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent, white) 28%, transparent);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
}

.chat-menu button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--light);
    font: inherit;
    font-size: var(--XS);
    text-align: left;
    cursor: pointer;
}

.chat-menu button:hover {
    background: color-mix(in srgb, var(--light) 8%, transparent);
}

.chat-menu button.active {
    color: var(--accent, var(--light));
    background: color-mix(in srgb, var(--accent, white) 12%, transparent);
}

.chat-menu-enter-active,
.chat-menu-leave-active {
    transition: opacity 0.15s ease, translate 0.2s ease !important;
}

.chat-menu-enter-from,
.chat-menu-leave-to {
    opacity: 0;
    translate: 0 -4px;
}

/* ---------- messages ---------- */
.chat-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* the site sets smooth scrolling on everything; here jumps (to the newest message, keeping place when older
       ones load) must be instant */
    scroll-behavior: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    scrollbar-width: thin;
}

.chat-welcome {
    margin-top: auto;
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 10px 10px 6px;
    text-align: center;
    animation: chat-fade 0.4s ease both;
}


.chat-welcome h3 {
    margin: 0;
    font-family: var(--look-display, var(--poppins));
    font-size: var(--M);
    color: var(--light);
}

.chat-welcome p {
    margin: 0;
    max-width: 30ch;
    font-size: var(--XS);
    line-height: 1.6;
    color: var(--gray-light);
}

.chat-msg {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 90%;
    animation: chat-fade 0.3s ease both;
}

.chat-msg.user {
    align-self: flex-end;
    align-items: flex-end;
}

.chat-msg.bot {
    align-self: flex-start;
}

.chat-bubble,
.chat-answer {
    font-size: var(--XS);
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.user .chat-bubble {
    padding: 10px 14px;
    white-space: pre-wrap;
    color: var(--dark);
    background: var(--accent, var(--light));
    border-radius: 18px 18px 6px 18px;
}

/* answers are laid out on the glass, no bubble */
.chat-msg.bot {
    max-width: 100%;
    width: 100%;
}

.chat-answer {
    color: var(--light);
    padding: 2px 2px 0;
}

.thinking {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--gray-light) !important;
}

.dots {
    display: inline-flex;
    gap: 4px;
}

.dots i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent, var(--light));
    animation: chat-dot 1.1s ease-in-out infinite;
}

.dots i:nth-child(2) { animation-delay: 0.15s; }
.dots i:nth-child(3) { animation-delay: 0.3s; }

@keyframes chat-dot {
    0%, 60%, 100% { translate: 0 0; opacity: 0.45; }
    30% { translate: 0 -5px; opacity: 1; }
}

.bot .chat-time {
    padding: 0 2px;
}

.chat-older {
    align-self: center;
    padding: 4px 12px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--light) 16%, transparent);
    background: transparent;
    color: var(--gray-light);
    font: inherit;
    font-size: var(--XXS);
    cursor: pointer;
}

.chat-older:hover {
    color: var(--light);
}

.chat-time {
    padding: 0 6px;
    font-size: 0.625rem;
    opacity: 0.6;
}

.chat-status-line {
    margin: -4px 0 0 6px;
    font-size: var(--XXS);
    font-style: italic;
    color: var(--gray-light);
}

@keyframes chat-fade {
    from {
        opacity: 0;
        translate: 0 6px;
    }
}

/* ---------- footer ---------- */
.chat-foot {
    flex: none;
    display: grid;
    align-content: start;
    gap: 12px;
    padding: 10px 14px 14px;
    border-top: 1px solid color-mix(in srgb, var(--light) 10%, transparent);
}

/* new chat: "Hi" in the middle, the input right under it, suggestions under that */
.empty .chat-list {
    flex: 1 1 0;
    padding-bottom: 6px;
}

.empty .chat-foot {
    flex: 1 1 0;
    border-top-color: transparent;
    padding-top: 8px;
}

.empty .chat-chips {
    justify-content: center;
    animation: chat-fade 0.4s 0.08s ease both;
}

.chat-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.chat-chip {
    padding: 5px 11px;
    border-radius: 16px;
    border: 1px solid color-mix(in srgb, var(--accent, white) 38%, transparent);
    background: transparent;
    color: var(--light);
    font: inherit;
    font-size: var(--XXS);
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease !important;
}

.chat-chip:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent, white) 16%, transparent);
}

.chat-chip:disabled {
    opacity: 0.45;
    cursor: default !important;
}

.chat-composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    /* a pill on one line (half its 50px height), still well rounded when it grows to several lines */
    border-radius: 25px;
    background: color-mix(in srgb, var(--light) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--light) 14%, transparent);
    transition: border-color 0.2s ease !important;
}

.chat-composer:focus-within {
    border-color: color-mix(in srgb, var(--accent, white) 60%, transparent);
}

.chat-composer textarea {
    flex: 1;
    min-height: 36px;
    max-height: 160px;
    padding: 8px 0;
    border: 0;
    outline: 0;
    resize: none;
    background: transparent;
    color: var(--light);
    font: inherit;
    font-size: var(--XS);
    line-height: 1.45;
}

.chat-composer textarea::placeholder {
    color: var(--gray-light);
}

.chat-send {
    flex: none;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--dark);
    background: var(--accent, var(--light));
    cursor: pointer;
    transition: opacity 0.2s ease, scale 0.25s cubic-bezier(0.34, 1.6, 0.5, 1) !important;
}

.chat-send:hover:not(:disabled) {
    scale: 1.06;
}

.chat-send:disabled {
    opacity: 0.35;
    cursor: default !important;
}

.chat-send svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.chat-send.stop {
    background: color-mix(in srgb, #ff5a5a 80%, var(--accent, white));
}

.chat-send.stop svg {
    fill: currentColor;
    stroke: none;
}

/* ---------- phones: bottom sheet ⇄ full screen ----------
   --p runs 0 (resting sheet) .. 1 (full screen) and follows the finger while dragging: the top corners
   straighten, the grip fades out and the header makes room for the status bar as it reaches the top */
.mode-sheet {
    left: 0;
    right: 0;
    /* the glass runs 45vh past the bottom of the screen (padded back out of the content), so sliding the
       sheet up with a transform shows more glass instead of a gap */
    bottom: -45vh;
    padding-bottom: 45vh;
    width: auto;
    border-radius: calc(var(--sheet-r, 26px) * (1 - var(--p, 0))) calc(var(--sheet-r, 26px) * (1 - var(--p, 0))) 0 0;
    border-bottom: 0;
    will-change: transform;
}

.mode-sheet.settling {
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.chat-scrim.sheet {
    background: rgba(0, 0, 0, calc(0.3 + 0.3 * var(--p, 0)));
    touch-action: none;
}

.sheet-grip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 6;
    height: 24px;
    display: grid;
    place-items: center;
    opacity: calc(1 - var(--p, 0));
    touch-action: none;
    cursor: grab !important;
}

.sheet-grip::before {
    content: "";
    width: 42px;
    height: 5px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--light) 38%, transparent);
}

.mode-sheet .chat-head {
    /* room for the grip at rest; room for the status bar at full screen */
    padding-top: calc(20px + var(--p, 0) * max(0px, env(safe-area-inset-top) - 6px));
    touch-action: none;
}

.chat-sheet-enter-active {
    transition: translate 0.5s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.chat-sheet-leave-active {
    transition: translate 0.3s cubic-bezier(0.4, 0, 1, 1) !important;
}

.chat-sheet-enter-from,
.chat-sheet-leave-to {
    translate: 0 100%;
}

/* ---------- phones ---------- */
@media screen and (max-width: 1000px) {
    .mode-overlay {
        width: 100vw;
        border-radius: 0;
        border: 0;
    }

    .chat-head {
        padding-top: max(14px, env(safe-area-inset-top));
    }

    .chat-foot {
        padding-bottom: max(14px, env(safe-area-inset-bottom));
    }
}
</style>

<style>
/* Bot answers (markdown, rendered with v-html so they're styled globally here) */
.chat-md > :first-child { margin-top: 0; }
.chat-md > :last-child { margin-bottom: 0; }
.chat-md p,
.chat-md ul,
.chat-md ol,
.chat-md pre,
.chat-md blockquote,
.chat-md .chat-md-table { margin: 0.55em 0; }
.chat-md ul,
.chat-md ol { padding-left: 1.3em; }
.chat-md ul { list-style: disc; }
.chat-md ul ul { list-style: circle; }
.chat-md ol { list-style: decimal; }
.chat-md ol ol { list-style: lower-alpha; }
.chat-md li { margin: 0.2em 0; }
.chat-md li::marker { color: var(--accent, var(--light)); }
.chat-md h1, .chat-md h2, .chat-md h3, .chat-md h4 { margin: 0.8em 0 0.4em; font-size: 1em; font-weight: 700; }
.chat-md strong { color: var(--light); font-weight: 600; }
.chat-md a { color: var(--accent, var(--light)); text-decoration: underline; text-underline-offset: 3px; }
.chat-md hr { border: 0; border-top: 1px solid color-mix(in srgb, var(--light) 14%, transparent); margin: 0.8em 0; }
.chat-md blockquote {
  padding: 6px 12px;
  border-left: 3px solid var(--accent, var(--light));
  border-radius: 0 8px 8px 0;
  background: color-mix(in srgb, var(--accent, white) 8%, transparent);
}
.chat-md code {
  padding: 1px 5px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: color-mix(in srgb, var(--light) 10%, transparent);
}
.chat-md pre {
  overflow-x: auto;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--light) 12%, transparent);
  background: color-mix(in srgb, var(--dark) 60%, transparent);
}
.chat-md pre code { padding: 0; background: none; }
.chat-md img { max-width: 100%; border-radius: 8px; }
.chat-md .chat-md-table { overflow-x: auto; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--light) 14%, transparent); }
.chat-md table { width: 100%; border-collapse: collapse; font-size: 0.95em; }
.chat-md th,
.chat-md td { padding: 6px 10px; text-align: left; vertical-align: top; overflow-wrap: normal; word-break: normal; min-width: 6.5em; border-bottom: 1px solid color-mix(in srgb, var(--light) 10%, transparent); }
.chat-md td:first-child { white-space: nowrap; font-weight: 500; }
.chat-md th { font-weight: 600; white-space: nowrap; background: color-mix(in srgb, var(--accent, white) 12%, transparent); }
.chat-md tr:nth-child(even) td { background: color-mix(in srgb, var(--light) 4%, transparent); }
.chat-md tr:last-child td { border-bottom: 0; }
/* typing caret at the end of a streaming answer */
.chat-md.streaming > :last-child::after {
  content: "▌";
  margin-left: 2px;
  color: var(--accent, var(--light));
  animation: chat-caret 0.9s steps(1) infinite;
}
@keyframes chat-caret { 50% { opacity: 0; } }

/* Dock: the page moves over to make room (fixed bars re-centre in the space that's left) */
:root {
  --chat-dock: 0px;
}
html.chat-docked body {
  padding-right: var(--chat-dock);
}
html.chat-docked #app {
  max-width: min(1000px, calc(100vw - var(--chat-dock) - 48px));
}
html.chat-docked :is(.nav-bar:not(.compact), .drip-zone) {
  left: calc((100vw - var(--chat-dock)) / 2) !important;
}
html.chat-docked .corner-dock {
  right: calc(24px + var(--chat-dock)) !important;
}
html.chat-dock-anim body {
  transition: padding-right 0.32s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
html.chat-dock-anim :is(.nav-bar, .drip-zone, .corner-dock) {
  transition: left 0.32s cubic-bezier(0.4, 0, 0.2, 1), right 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease !important;
}
</style>
