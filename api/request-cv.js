// Vercel serverless function: POST /api/request-cv  { email }
// Emails the resume PDF to the visitor and (optionally) notifies the owner.
//
// Required environment variables (set them in Vercel → Project → Settings → Environment Variables,
// and in a local `.env.local` for `npm run dev`):
//   SMTP_USER      the sending mailbox, e.g. a Gmail address
//   SMTP_PASS      an app password for that mailbox (Gmail: Google Account → Security → App passwords)
// Optional:
//   SMTP_HOST      default smtp.gmail.com
//   SMTP_PORT      default 465
//   CV_FROM_NAME   default "Ory Chanraksa"
//   CV_NOTIFY_TO   address that gets a short "someone requested your CV" note (default SMTP_USER)
//   CV_PUBLIC_URL  site origin used to fetch the PDF, e.g. https://chanraksa.com (default: request host)

import nodemailer from 'nodemailer';

const RESUME_PATH = '/ORY-CHANRAKSA-RESUME.pdf';
const RESUME_FILENAME = 'ORY-CHANRAKSA-RESUME.pdf';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort throttle; serverless instances are short-lived, so this only stops rapid repeats.
const recent = new Map();
const WINDOW_MS = 60 * 1000;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const COPY = {
  en: {
    eyebrow: 'Resume request',
    title: 'Thanks for stopping by 👋',
    hi: 'Hi there,',
    p1: 'Thank you for your interest in my work! As requested, my resume is attached to this email.',
    p2: "I'm a full-stack software engineer based in Phnom Penh, building web and mobile platforms used by government ministries, public institutions and startups across Cambodia.",
    p3: "If you'd like to talk about a role, a project or a collaboration, just reply to this email. I'd be glad to hear from you.",
    cta: 'View my portfolio',
    regards: 'Best regards,',
    subject: (name) => `${name} | Resume`,
  },
  km: {
    eyebrow: 'សំណើសុំប្រវត្តិរូប',
    title: 'សូមអរគុណដែលបានចូលមើល 👋',
    hi: 'សួស្តី,',
    p1: 'សូមអរគុណចំពោះការចាប់អារម្មណ៍លើការងាររបស់ខ្ញុំ! តាមការស្នើសុំ ប្រវត្តិរូបរបស់ខ្ញុំត្រូវបានភ្ជាប់មកជាមួយអ៊ីមែលនេះ។',
    p2: 'ខ្ញុំជាវិស្វករកម្មវិធី Full-stack នៅរាជធានីភ្នំពេញ ដែលបង្កើតវេទិកាវេប និងកម្មវិធីទូរសព្ទ សម្រាប់ក្រសួង ស្ថាប័នសាធារណៈ និងក្រុមហ៊ុនបង្កើតថ្មីនៅទូទាំងប្រទេសកម្ពុជា។',
    p3: 'ប្រសិនបើអ្នកចង់ពិភាក្សាអំពីការងារ គម្រោង ឬកិច្ចសហការ គ្រាន់តែឆ្លើយតបមកអ៊ីមែលនេះ។ ខ្ញុំរីករាយនឹងទទួលដំណឹងពីអ្នក។',
    cta: 'មើលផលប័ត្ររបស់ខ្ញុំ',
    regards: 'ដោយក្តីគោរព,',
    signName: 'អោយ ចន្ទ័រក្សា', // full name in Khmer for the signature
    subject: (name) => `${name} | ប្រវត្តិរូប`,
  },
};

function visitorEmail(fromName, siteUrl, lang) {
  const c = COPY[lang] || COPY.en;
  const signName = c.signName || fromName;
  const text = `${c.hi}

${c.p1}

${c.p2}

${c.p3}

Portfolio: ${siteUrl}
LinkedIn: https://www.linkedin.com/in/ory-chanraksa-1702b6263/
GitHub: https://github.com/RaksaOC

${c.regards}
${signName}`;

  const html = `
  <div style="background:#0e0e0e;padding:32px 16px;font-family:Poppins,'Kantumruy Pro',Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#161616;border:1px solid #2a2a2a;border-radius:16px;padding:32px;color:#eaeaea">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#a0a0a0">${c.eyebrow}</p>
      <h1 style="margin:0 0 20px;font-size:24px;color:#ffffff">${c.title}</h1>
      <p style="margin:0 0 14px;line-height:1.7">${c.p1}</p>
      <p style="margin:0 0 14px;line-height:1.7">${c.p2}</p>
      <p style="margin:0 0 24px;line-height:1.7">${c.p3}</p>
      <a href="${escapeHtml(siteUrl)}" style="display:inline-block;background:#ffffff;color:#0e0e0e;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:600;font-size:14px">${c.cta}</a>
      <p style="margin:28px 0 0;line-height:1.6">${c.regards}<br><strong style="color:#ffffff">${escapeHtml(signName)}</strong></p>
      <p style="margin:18px 0 0;font-size:13px;color:#a0a0a0">
        <a href="https://www.linkedin.com/in/ory-chanraksa-1702b6263/" style="color:#a0a0a0">LinkedIn</a> &nbsp;·&nbsp;
        <a href="https://github.com/RaksaOC" style="color:#a0a0a0">GitHub</a>
      </p>
    </div>
  </div>`;
  return { text, html, subject: c.subject(fromName) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { ok: false, error: 'Invalid request' });
  }

  // Honeypot: real visitors never fill the hidden "company" field
  if (body.company) return send(res, 200, { ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return send(res, 400, { ok: false, error: 'Please enter a valid email address.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const key = `${ip}|${email}`;
  const now = Date.now();
  if (recent.has(key) && now - recent.get(key) < WINDOW_MS) {
    return send(res, 429, { ok: false, error: 'Already sent. Please check your inbox (and spam folder).' });
  }

  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[request-cv] SMTP_USER / SMTP_PASS are not set');
    return send(res, 500, { ok: false, error: 'Email service is not configured yet.' });
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const fromName = process.env.CV_FROM_NAME || 'Ory Chanraksa';
  const proto = req.headers['x-forwarded-proto'] || (String(req.headers.host || '').startsWith('localhost') ? 'http' : 'https');
  const siteUrl = (process.env.CV_PUBLIC_URL || `${proto}://${req.headers.host}`).replace(/\/$/, '');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const pdf = await fetch(`${siteUrl}${RESUME_PATH}`);
    if (!pdf.ok) throw new Error(`Resume fetch failed: ${pdf.status}`);
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    const lang = body.lang === 'km' ? 'km' : 'en';
    const { text, html, subject } = visitorEmail(fromName, siteUrl, lang);
    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_USER}>`,
      to: email,
      replyTo: SMTP_USER,
      subject,
      text,
      html,
      attachments: [{ filename: RESUME_FILENAME, content: pdfBuffer, contentType: 'application/pdf' }],
    });

    recent.set(key, now);

    // Let the owner know who asked (failure here should not fail the visitor's request).
    // Awaited so the serverless instance isn't frozen before it is sent.
    const notifyTo = process.env.CV_NOTIFY_TO || SMTP_USER;
    await transporter
      .sendMail({
        from: `"Portfolio" <${SMTP_USER}>`,
        to: notifyTo,
        subject: `CV requested by ${email}`,
        text: `${email} requested your resume from ${siteUrl} on ${new Date().toISOString()}.`,
      })
      .catch((e) => console.error('[request-cv] notify failed', e.message));

    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('[request-cv] send failed', err.message);
    return send(res, 502, { ok: false, error: 'Could not send the email right now. Please try again later.' });
  }
}
