// The "resume request received" email (src/api/request-cv.js), styled after the theme the visitor was
// browsing when they asked. The form (RequestCV.vue) sends the theme's swatches and fonts from
// src/themes/<id>/index.js; everything here is validated, since it comes from the browser.
// Not an API route itself: vite.config.js / server.js / api/ only mount request-cv.js and chat.js.

const HEX_RE = /^#[0-9a-f]{6}$/i;
const FAMILY_RE = /^[A-Za-z0-9 ]{1,40}$/;
const FONTS_QUERY_RE = /^[A-Za-z0-9+:;@,.&=]{1,200}$/;

// Monochrome, dark: what the email looked like before it followed the theme
const DEFAULT_THEME = {
  name: 'Monochrome', km: '', mode: 'dark',
  bg: '#0e0e0e', accent: '#ffffff', text: '#eaeaea',
  fonts: '', display: 'Poppins', body: 'Poppins', kmDisplay: 'Kantumruy Pro', kmBody: 'Kantumruy Pro',
};

const str = (v, max) => String(v ?? '').slice(0, max);
const hex = (v, fallback) => (HEX_RE.test(String(v)) ? String(v).toLowerCase() : fallback);
const family = (v, fallback) => (FAMILY_RE.test(String(v)) ? String(v) : fallback);

/** The theme payload from the form → a safe palette + fonts (falls back to Monochrome dark). */
export function normalizeTheme(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_THEME };
  const sw = Array.isArray(raw.sw) ? raw.sw : [];
  const fonts = FONTS_QUERY_RE.test(String(raw.fonts || '')) ? String(raw.fonts) : '';
  // `family=Marcellus&family=Marcellus+SC` → first family for headings, last for body text
  const families = fonts.split('&').map((p) => p.replace(/^family=/, '').split(':')[0].replace(/\+/g, ' '));
  const km = raw.kmFonts && typeof raw.kmFonts === 'object' ? raw.kmFonts : {};
  return {
    name: str(raw.name, 40) || DEFAULT_THEME.name,
    km: str(raw.km, 40),
    mode: raw.mode === 'light' ? 'light' : 'dark',
    bg: hex(sw[0], DEFAULT_THEME.bg),
    accent: hex(sw[1], DEFAULT_THEME.accent),
    text: hex(sw[2], DEFAULT_THEME.text),
    fonts,
    display: family(families[0], DEFAULT_THEME.display),
    body: family(families[families.length - 1], DEFAULT_THEME.body),
    kmDisplay: family(km.display, DEFAULT_THEME.kmDisplay),
    kmBody: family(km.body, DEFAULT_THEME.kmBody),
  };
}

/* ---------- colour helpers (email clients handle plain hex best) ---------- */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const bestOn = (bgc, ...options) => options.reduce((best, c) => (contrast(bgc, c) > contrast(bgc, best) ? c : best));

function palette(t) {
  // some themes' "text" swatch is soft (Monochrome dark is grey): headings get a stronger version of it
  const strong = bestOn(t.bg, t.text, mix(t.text, t.mode === 'light' ? '#000000' : '#ffffff', 0.5));
  return {
    page: t.bg,
    card: mix(t.bg, t.text, 0.05),
    border: mix(t.bg, t.text, 0.16),
    heading: strong,
    body: mix(t.bg, strong, 0.86),
    muted: mix(t.bg, t.text, 0.6),
    // the eyebrow / links in the accent, unless it barely shows on the card
    accentText: contrast(mix(t.bg, t.text, 0.05), t.accent) >= 2.2 ? t.accent : strong,
    button: t.accent,
    buttonText: bestOn(t.accent, t.bg, '#ffffff', '#111111'),
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const LINKEDIN = 'https://www.linkedin.com/in/ory-chanraksa-1702b6263/';
const GITHUB = 'https://github.com/RaksaOC';

const COPY = {
  en: {
    eyebrow: 'Resume request',
    title: 'Your request is in.',
    lead: "Thanks for your interest in my work. I'll send my resume to you personally, shortly.",
    aboutTitle: 'About me',
    role: 'Full-stack software engineer · Phnom Penh',
    reply: 'Have a role or project in mind? Reply to this email.',
    cta: 'View portfolio',
    styled: (name) => `Styled after the ${name} theme you were browsing.`,
    subject: (name) => `${name} | Resume request received`,
  },
  km: {
    eyebrow: 'សំណើសុំប្រវត្តិរូប',
    title: 'បានទទួលសំណើរបស់អ្នក។',
    lead: 'សូមអរគុណចំពោះការចាប់អារម្មណ៍លើការងាររបស់ខ្ញុំ។ ខ្ញុំនឹងផ្ញើប្រវត្តិរូបទៅអ្នកដោយផ្ទាល់ក្នុងពេលឆាប់ៗនេះ។',
    aboutTitle: 'អំពីខ្ញុំ',
    role: 'អ្នកអភិវឌ្ឍន៍កម្មវិធី Full-stack · ភ្នំពេញ',
    reply: 'មានការងារ ឬគម្រោងចង់ពិភាក្សា? ឆ្លើយតបមកអ៊ីមែលនេះបាន។',
    cta: 'មើលផលប័ត្រ',
    signName: 'អោយ ចន្ទ័រក្សា', // full name in Khmer for the signature
    styled: (name) => `រចនាតាមរចនាប័ទ្ម ${name} ដែលអ្នកកំពុងមើល។`,
    subject: (name) => `${name} | បានទទួលសំណើសុំប្រវត្តិរូប`,
  },
};

/**
 * The email to the visitor: { subject, text, html }.
 * `theme` is normalizeTheme()'s result.
 */
export function visitorEmail({ fromName, siteUrl, lang, theme }) {
  const c = COPY[lang] || COPY.en;
  const t = theme || { ...DEFAULT_THEME };
  const p = palette(t);
  const signName = c.signName || fromName;
  const themeName = lang === 'km' && t.km ? t.km : t.name;
  const site = siteUrl.replace(/^https?:\/\//, '');

  const stack = (main) => `'${main}', ${lang === 'km' ? "'Kantumruy Pro', " : ''}Poppins, 'Segoe UI', Helvetica, Arial, sans-serif`;
  const headFont = stack(lang === 'km' ? t.kmDisplay : t.display);
  const bodyFont = stack(lang === 'km' ? t.kmBody : t.body);
  // web fonts load in Apple Mail / iOS and some others; everyone else gets the fallbacks
  const fontQuery = lang === 'km'
    ? [...new Set([t.kmDisplay, t.kmBody])].map((f) => `family=${f.replace(/ /g, '+')}`).join('&')
    : t.fonts;
  const fontLink = fontQuery
    ? `<link href="https://fonts.googleapis.com/css2?${escapeHtml(fontQuery)}&amp;display=swap" rel="stylesheet">`
    : '';

  const label = `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${p.muted}`;

  const text = [
    c.title,
    c.lead,
    `${c.aboutTitle}\n${signName}, ${c.role}`,
    c.reply,
    `Portfolio: ${siteUrl}\nLinkedIn: ${LINKEDIN}\nGitHub: ${GITHUB}`,
    signName,
  ].join('\n\n');

  const html = `<!doctype html>
<html lang="${lang === 'km' ? 'km' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="${t.mode}">
<meta name="supported-color-schemes" content="${t.mode}">
${fontLink}
</head>
<body style="margin:0;padding:0;background:${p.page}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${p.page}">
<tr><td align="center" style="padding:40px 16px;font-family:${bodyFont};color:${p.body}">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${p.card};border:1px solid ${p.border};border-radius:14px;text-align:left">
    <tr><td style="padding:36px 36px 28px">
      <p style="margin:0 0 14px;${label};color:${p.accentText}">${c.eyebrow}</p>
      <h1 style="margin:0 0 12px;font-family:${headFont};font-size:28px;line-height:1.2;font-weight:700;color:${p.heading}">${c.title}</h1>
      <p style="margin:0;font-size:15px;line-height:1.65">${c.lead}</p>
    </td></tr>

    <tr><td style="padding:0 36px">
      <div style="height:1px;background:${p.border};line-height:1px;font-size:0">&nbsp;</div>
    </td></tr>

    <tr><td style="padding:28px 36px 8px">
      <p style="margin:0 0 10px;${label}">${c.aboutTitle}</p>
      <p style="margin:0 0 2px;font-family:${headFont};font-size:17px;font-weight:700;color:${p.heading}">${escapeHtml(signName)}</p>
      <p style="margin:0;font-size:13px;color:${p.muted}">${c.role}</p>
    </td></tr>

    <tr><td style="padding:24px 36px 36px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-radius:999px;background:${p.button}">
          <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:${p.buttonText};text-decoration:none;border-radius:999px">${c.cta} &rarr;</a>
        </td>
        <td style="padding-left:18px;font-size:13px">
          <a href="${LINKEDIN}" style="color:${p.body};text-decoration:none">LinkedIn</a>
          <span style="color:${p.muted}">&nbsp;/&nbsp;</span>
          <a href="${GITHUB}" style="color:${p.body};text-decoration:none">GitHub</a>
        </td>
      </tr></table>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:${p.muted}">${c.reply}</p>
    </td></tr>
  </table>

  <p style="max-width:560px;margin:16px auto 0;font-size:11px;line-height:1.6;color:${p.muted}">${escapeHtml(site)} &middot; ${escapeHtml(c.styled(themeName))}</p>

</td></tr>
</table>
</body>
</html>`;
  return { text, html, subject: c.subject(fromName) };
}
