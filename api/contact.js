const { randomUUID } = require('node:crypto');

const CONTACT_EMAIL = 'hello@xipevents.com';

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  let body;
  try {
    body = typeof request.body === 'string' ? JSON.parse(request.body) : (request.body || {});
  } catch {
    return response.status(400).json({ error: 'Please check the form and try again.' });
  }
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  // Quietly accept automated submissions that fill the hidden field.
  if (body.company) return response.status(200).json({ ok: true });

  if (!name || name.length > 120 || !isValidEmail(email) || email.length > 254 || !message || message.length > 5000) {
    return response.status(400).json({ error: 'Please check the form and try again.' });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL.');
    return response.status(500).json({ error: 'The form is not configured yet.' });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'xip-events-marketing/1.0',
        'Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `XIP Events enquiry from ${name}`,
        html: `<h2>New XIP Events enquiry</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br />${safeMessage}</p>`,
        text: `New XIP Events enquiry\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      console.error('Resend rejected the email:', await resendResponse.text());
      return response.status(502).json({ error: 'Unable to send your message right now.' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return response.status(502).json({ error: 'Unable to send your message right now.' });
  }
};
