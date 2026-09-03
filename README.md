# XIP Events marketing website

Standalone one-page marketing website for XIP Events.

## Run locally

Open `index.html` in a browser, or serve the directory with any static file server:

```bash
python3 -m http.server 8000
```

The site has no build step and no dependency on the separate XIP Events project.

## Contact form

The static contact form sends JSON to `https://api.xipevents.com/api/contact`. The separate Node server in `server/` sends the enquiry through Resend to the private XIP Events inbox. The Resend API key is never exposed to the browser or committed to this repository.

### Run the contact server locally

The server requires Node.js 18 or newer because it uses the built-in `fetch` API:

```bash
RESEND_API_KEY=re_xxxxxxxxx \
RESEND_FROM_EMAIL='XIP Events <notifications@send.xipevents.com>' \
ALLOWED_ORIGINS='http://localhost:8000' \
node server/index.js
```

Copy `server/.env.example` to a local environment file or set the variables in the server host’s dashboard. `RESEND_FROM_EMAIL` must use a sender domain verified in Resend. The included `render.yaml` is ready for deployment to Render; alternatively, deploy `server/` to any Node-compatible host. Point the `api` DNS record for `xipevents.com` to that host. GitHub Pages continues to serve the website itself.
