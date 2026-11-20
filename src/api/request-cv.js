// Vercel serverless function: POST /api/request-cv  { email, lang, theme }
// Emails the visitor a "request received, I'll send my resume shortly" note, styled after the theme they were
// browsing (src/api/cv-email.js), and notifies the owner, who replies with the resume by hand.
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
//   CV_PUBLIC_URL  site origin for the "View my portfolio" link, e.g. https://chanraksa.com (default: request host)

import nodemailer from 'nodemailer';
import { normalizeTheme, visitorEmail } from './cv-email.js';

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
    const lang = body.lang === 'km' ? 'km' : 'en';
    const theme = normalizeTheme(body.theme);
    const { text, html, subject } = visitorEmail({ fromName, siteUrl, lang, theme });
    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_USER}>`,
      to: email,
      replyTo: SMTP_USER,
      subject,
      text,
      html,
    });

    recent.set(key, now);

    // Let the owner know who asked, so they can send the resume: replying to this note goes to the visitor.
    // (Failure here should not fail the visitor's request. Awaited so the serverless instance isn't frozen
    // before it is sent.)
    const notifyTo = process.env.CV_NOTIFY_TO || SMTP_USER;
    await transporter
      .sendMail({
        from: `"Portfolio" <${SMTP_USER}>`,
        to: notifyTo,
        replyTo: email,
        subject: `CV requested by ${email}: send it to them`,
        text: `${email} requested your resume from ${siteUrl} on ${new Date().toISOString()}.
` +
          `Language: ${lang === 'km' ? 'Khmer' : 'English'} · Theme: ${theme.name} (${theme.mode})

` +
          `They were told you'll send it shortly. Reply to this email with the PDF attached and it goes to them.`,
      })
      .catch((e) => console.error('[request-cv] notify failed', e.message));

    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('[request-cv] send failed', err.message);
    return send(res, 502, { ok: false, error: 'Could not send the email right now. Please try again later.' });
  }
}
