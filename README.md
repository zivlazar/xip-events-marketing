# XIP Events marketing website

Standalone one-page marketing website for XIP Events.

## Run locally

Open `index.html` in a browser, or serve the directory with any static file server:

```bash
python3 -m http.server 8000
```

The site has no build step and no dependency on the separate XIP Events project.

## Contact form

The form posts to `api/contact.js`, a Vercel-compatible serverless function that sends the message through Resend. The recipient is configured as `hello@xipevents.com` in the server-side function and is not displayed on the website.

Before deploying, create a Resend API key with sending access, verify the sending domain in Resend, and set the variables in `.env.example` in the deployment environment. The site needs to be deployed on a host that supports the `/api` function; the static HTML preview alone cannot send email.
