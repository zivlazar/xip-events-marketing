# XIP Events marketing website

Standalone one-page marketing website for XIP Events.

## Run locally

Open `index.html` in a browser, or serve the directory with any static file server:

```bash
python3 -m http.server 8000
```

The site has no build step and no dependency on the separate XIP Events project.

## Contact form

The static contact form posts to `https://api.xipevents.com/api/contact`. The endpoint runs in the XIP Vercel Node runtime and sends enquiries through Resend from the verified `send.xipevents.com` subdomain.
