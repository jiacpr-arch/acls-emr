# CPR · morroo — Public CPR + AED Landing

Standalone landing page + learning module for the general public, deployed at **cpr.morroo.com**.

This sub-app is fully decoupled from the main ACLS app at the repo root — it has its own `package.json`, `vite.config.js`, and `node_modules`.

## Local development

```bash
cd cpr
npm install
npm run dev
```

The dev server runs on http://localhost:5173 by default.

## Build

```bash
cd cpr
npm run build
```

Output goes to `cpr/dist/`.

## Vercel deployment

Create a **separate Vercel project** pointing at this same repo:

| Setting             | Value             |
| ------------------- | ----------------- |
| Root Directory      | `cpr`             |
| Framework Preset    | Vite              |
| Build Command       | `npm run build`   |
| Output Directory    | `dist`            |
| Install Command     | `npm install`     |
| Production Domain   | `cpr.morroo.com`  |

### DNS setup (at your registrar / Cloudflare)

Add a CNAME record:

```
cpr.morroo.com  CNAME  cname.vercel-dns.com
```

Then in the Vercel project → Settings → Domains, add `cpr.morroo.com`.

## Structure

```
cpr/
├── src/
│   ├── components/   ← Nav, Hero, Curriculum, FAQ, Footer, etc.
│   ├── pages/        ← Landing (/), Learn (/learn — placeholder)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/           ← favicon, icons
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

## Roadmap

- [x] Landing page (hero, curriculum, FAQ, CTA)
- [ ] Lesson 1: Recognize cardiac arrest
- [ ] Lesson 2: Call 1669
- [ ] Lesson 3: Hands-only CPR with metronome
- [ ] Lesson 4: AED simulator
- [ ] Lesson 5: Quiz + digital certificate
- [ ] Open Graph image
- [ ] Analytics
