# XIP Events project decisions

Last updated: 2 September 2026

## Product positioning

- The product is called **XIP Events**.
- XIP Events is a tool and a solution, not an events agency.
- The core description is: an affordable digital operating layer for festivals.
- The product combines an internal live messaging board, a private festival social network, visitor coordination tools, and footfall/engagement insight.
- The initial audience is independent and cost-conscious festivals that cannot afford complex enterprise systems.
- The product should be presented as affordable by design and scalable by architecture.
- Avoid generic agency language, exaggerated claims, and slogans such as “Good enough isn’t our thing.” Keep copy factual and product-led.

## Website narrative

The one-page site follows this order:

1. The problem — festival communication is split across social media, WhatsApp, printed signs, event apps, radio, and staff coordination.
2. The solution — one private, live network for organisers, venue teams, and visitors.
3. Why it’s different — affordable entry for independent festivals and modular scalability for larger, multi-venue festivals.

The hero title is:

> Who is this band? Where are my friends?

The solution feature cards cover live messaging, private social networking, visitor coordination, footfall and engagement, and modular platform capability.

## Brand system

- Ink: `#151515`
- Cream: `#F8F3E7`
- Lime: `#D9F238`
- Cyan: `#31D4D0`
- Pink: `#F05A9D`
- Orange: `#FF8A36`
- Blue: `#4A78F5`
- Red: `#D94343`
- Headings: Bricolage Grotesque Bold
- Body and buttons: Manrope Regular

## Hosting and repository

- Repository: `https://github.com/zivlazar/xip-events-marketing`
- The repository is public.
- GitHub Pages publishes from the `main` branch and root directory.
- `CNAME` contains `xipevents.com`.
- The site is intended to be hosted on GitHub Pages, independently from the other XIP Events project.
- Spaceship remains the DNS provider. The nameservers are `launch1.spaceship.net` and `launch2.spaceship.net`.
- Required GitHub Pages DNS records are four apex A records for GitHub Pages and a `www` CNAME to `zivlazar.github.io`.
- The canonical, sitemap, and social metadata currently assume `https://xipevents.com/`. Update these if the public domain changes.

## Images

- `assets/hero-festival-scan.jpg` is the hero image: a festival visitor scanning a QR code.
- `assets/visitor-phone-ui-optimized.jpeg` is the product screenshot used in the solution section.
- The hero image is prioritized for loading and both images have descriptive alt text and dimensions.

## Contact form

- The static GitHub Pages site posts to `https://api.xipevents.com/api/contact`.
- The endpoint is hosted by the existing Vercel Node runtime and sends through Resend.
- Resend sends from the verified `send.xipevents.com` subdomain to `hello@xipevents.com`.
- The email address is not displayed in visible page content.
- The form fields are: name (required), organisation or festival name (required), email (required), phone number (optional), and message (required).
- The button label is `Send`.
- A fallback `Open email app` link appears if the initial mail client launch does not work.

## SEO decisions

- The page title is `XIP Events | Festival communication and visitor coordination`.
- The meta description uses the product category and core features without keyword stuffing.
- The page includes `robots.txt`, `sitemap.xml`, canonical metadata, Open Graph/Twitter metadata, and JSON-LD for Organization, WebSite, and SoftwareApplication.
- The page includes a visible FAQ section for factual long-tail queries.
- Internal links use descriptive anchor text between the problem, solution, differentiation, FAQ, and contact sections.
- After launch, verify the public domain in Google Search Console and submit `/sitemap.xml`.

## Working conventions

- Keep the site static and dependency-free unless a deliberate hosting decision changes.
- Preserve the one-page structure unless there is a clear SEO or product reason to add separate pages.
- Keep future copy factual, specific, and centred on what the product does.
- Run `node --check script.js` and `git diff --check` before committing.
