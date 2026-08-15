# Deployment — 2Click.in

## Canonical production domain

- `https://2click.in` (preferred)
- `https://www.2click.in` → redirect to apex (configure in Vercel Domains)

## Current status

DNS may already point at Vercel while returning `DEPLOYMENT_NOT_FOUND` until a Production deployment exists for the linked project.

Working reference deploy (may change): see Vercel dashboard / temporary preview URL in older docs.

## Vercel steps

1. Import `abhudaya2786/2click-net`
2. Build command: `npm run build:vercel` (from `vercel.json`)
3. Output: `public`
4. Env: `GEMINI_API_KEY` (optional), `OPENAI_API_KEY` (optional), `AI_PROVIDER`, WhatsApp vars if used
5. Disable Deployment Protection for Production
6. Attach domains `2click.in` + `www`
7. Redeploy Production after merge

## DNS (after Vercel shows records)

Typically:

- `A` / `CNAME` as shown in Vercel Domains for apex + www
- Remove Hostinger website pointing if still active

Do **not** change DNS from this agent automatically.

## Hostinger static (UI only)

```bash
npm run build && npm run pack:hostinger
```

Upload `dist/hostinger-upload/` to `public_html`. API will not run on plain Hostinger — point `/api` to Vercel/VPS or use full Vercel deploy.

## Docker / VPS

```bash
npm run build && npm start
# or docker build + run exposing 3000
```

File-based auth/org under `data/` works better on a single VPS than on serverless.
