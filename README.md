# Skats Consultancy Website

Premium immigration advisory and visa processing portal for Skats Leadership Development Consults Ltd.

## Tech Stack
- Pure HTML5 / Vanilla CSS3 / JavaScript (ES6+)
- No frameworks, no build step — deployable to any static host

## Local Development
```bash
# Just open index.html in your browser, or serve with:
npx serve .
```

## Deployment
Push to `main` → connect to Netlify / GitHub Pages / Vercel.

## Project Structure
```
/
├── index.html              # Homepage
├── services.html           # Service overview
├── services/               # Per-visa deep dives
├── destinations/           # SEO landing pages (UK, US, Canada, AU, Schengen)
├── eligibility.html        # Interactive lead-capture quiz
├── portal-login.html       # Client portal auth screen
├── portal*.html            # Case manager dashboard modules
├── resources.html          # Blog index
├── article-template.html   # Blog post template
├── faq.html / testimonials.html
├── pricing.html / about.html / contact.html / how-it-works.html
├── disclaimer.html / refund-policy.html / terms-of-service.html / privacy-policy.html
├── styles.css / js/main.js
├── favicon.png / logo.png
├── sitemap.xml / robots.txt
└── .well-known/security.txt
```

## Security
See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.
