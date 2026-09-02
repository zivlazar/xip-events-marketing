# XIP Events marketing website

Standalone one-page marketing website for XIP Events.

## Run locally

Open `index.html` in a browser, or serve the directory with any static file server:

```bash
python3 -m http.server 8000
```

The site has no build step and no dependency on the separate XIP Events project.

## Contact form

The static contact form opens the visitor’s default email app with a pre-filled enquiry addressed to `hello@xipevents.com`. A backend email service is not required, but the visitor must have an email app configured on their device.
