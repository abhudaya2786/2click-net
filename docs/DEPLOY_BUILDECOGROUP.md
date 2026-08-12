# Deploy buildecogroup.com

Product brand is **BuildEco Group** on domain **https://www.buildecogroup.com**.

## 1. Merge the rebrand PR

Merge PR that rebrands 2click.in → buildecogroup.com into `main`  
(https://github.com/abhudaya2786/2click-net/pull/47).

Vercel will rebuild from `main` automatically.

## 2. Add domain in Vercel

1. Vercel → your **2click-net / buildecogroup** project → **Settings → Domains**
2. Add:
   - `buildecogroup.com`
   - `www.buildecogroup.com`
3. Prefer **www** as primary; redirect apex → www (Vercel option).

## 3. DNS at your domain registrar

Use the exact records Vercel shows. Typical pattern:

| Type  | Name | Value                          |
|-------|------|--------------------------------|
| A     | `@`  | `76.76.21.21` (Vercel apex)    |
| CNAME | `www`| `cname.vercel-dns.com`         |

Wait for DNS (often 5–60 minutes).

## 4. Backend CORS

On the API host, set:

```bash
CORS_ORIGINS=https://buildecogroup.com,https://www.buildecogroup.com,http://localhost:3000
```

Restart the API after changing env.

## 5. Admin branding (after site is up)

1. Login as super admin  
2. Administration → Branding / White Label  
3. Brand name: **BuildEco Group**  
4. Save  

## 6. Verify

- https://www.buildecogroup.com  
- https://buildecogroup.com (should open or redirect)  
- Footer shows BuildEco Group / sales@buildecogroup.com  
- `/api/health` via site proxy works  

## Optional: keep old 2click.in

Point old domain DNS to the same Vercel project, or set a redirect 2click.in → buildecogroup.com.
