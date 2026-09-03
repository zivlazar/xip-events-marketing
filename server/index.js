const http = require('node:http');
const { randomUUID } = require('node:crypto');

const CONTACT_EMAIL = 'hello@xipevents.com';
const PORT = Number(process.env.PORT || 8787);
const BODY_LIMIT = 12_000;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://xipevents.com,https://www.xipevents.com,http://localhost:8000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const requestsByIp = new Map();

function setCorsHeaders(response, origin) {
  response.setHeader('Vary', 'Origin');
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let received = 0;
    const chunks = [];

    request.on('data', (chunk) => {
      received += chunk.length;
      if (received > BODY_LIMIT) {
        reject(new Error('Request body is too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Request body must be valid JSON'));
      }
    });

    request.on('error', reject);
  });
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clientIp(request) {
  return (request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
}

function isRateLimited(request) {
  const ip = clientIp(request);
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) {
    requestsByIp.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestsByIp.set(ip, recent);
  return false;
}

function buildEmail({ name, organisation, email, phone, message }) {
  const phoneLine = phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : '';
  const textPhoneLine = phone ? `\nPhone: ${phone}` : '';
  const subject = `XIP Events enquiry from ${organisation.replace(/[\r\n]/g, ' ')}`;
  const text = [
    `Name: ${name}`,
    `Organisation or festival: ${organisation}`,
    `Email: ${email}${textPhoneLine}`,
    '',
    message,
  ].join('\n');
  const html = [
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Organisation or festival:</strong> ${escapeHtml(organisation)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    phoneLine,
    `<p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
  ].join('');

  return { subject, text, html };
}

async function handleContact(request, response) {
  const origin = request.headers.origin;
  setCorsHeaders(response, origin);

  if (origin && !allowedOrigins.has(origin)) {
    sendJson(response, 403, { error: 'Origin not allowed' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { error: 'Too many requests' });
    return;
  }

  let data;
  try {
    data = await readJson(request);
  } catch (error) {
    const status = error.message === 'Request body is too large' ? 413 : 400;
    sendJson(response, status, { error: error.message });
    return;
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    sendJson(response, 400, { error: 'Request body must be an object' });
    return;
  }

  if (clean(data.company)) {
    sendJson(response, 200, { ok: true });
    return;
  }

  const enquiry = {
    name: clean(data.name),
    organisation: clean(data.organisation),
    email: clean(data.email),
    phone: clean(data.phone),
    message: clean(data.message),
  };
  const errors = [];

  if (!enquiry.name || enquiry.name.length > 120) errors.push('Please provide your name.');
  if (!enquiry.organisation || enquiry.organisation.length > 160) errors.push('Please provide your organisation or festival name.');
  if (!validEmail(enquiry.email) || enquiry.email.length > 254) errors.push('Please provide a valid email address.');
  if (enquiry.phone.length > 60) errors.push('Please check your phone number.');
  if (!enquiry.message || enquiry.message.length > 5000) errors.push('Please tell us about your needs.');

  if (errors.length) {
    sendJson(response, 400, { error: errors[0] });
    return;
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL');
    sendJson(response, 503, { error: 'Contact service is not configured' });
    return;
  }

  const email = buildEmail(enquiry);
  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'xip-events-contact-server/1.0',
        'Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: enquiry.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
  } catch (error) {
    console.error('Resend request failed:', error.message);
    sendJson(response, 502, { error: 'Could not send message' });
    return;
  }

  if (!resendResponse.ok) {
    console.error('Resend rejected the message with status', resendResponse.status);
    sendJson(response, 502, { error: 'Could not send message' });
    return;
  }

  sendJson(response, 200, { ok: true });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/health' && request.method === 'GET') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === '/contact' || requestUrl.pathname === '/api/contact') {
    handleContact(request, response).catch((error) => {
      console.error('Unhandled contact error:', error);
      if (!response.headersSent) sendJson(response, 500, { error: 'Unexpected server error' });
    });
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`XIP Events contact server listening on port ${PORT}`);
});
