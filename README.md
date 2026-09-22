# શાળા મુલાકાત સર્વેક્ષણ – Vercel project

- `index.html` – survey page for parents (your Vercel link)
- `results.html` – results page for you (your Vercel link + /results), password protected
- `api/submit.js` – saves each response
- `api/results.js` – sends responses to the results page (only when logged in)
- `api/login.js`, `api/logout.js`, `api/_auth.js` – results login; stays logged in for 10 days

## One-time setup
1. Upload this folder to Vercel (GitHub import, or run `npx vercel --prod` inside the folder).
2. In the Vercel project: Storage → Create Database → Upstash (Redis) → connect it to this project.
3. Settings → Environment Variables → add `RESULTS_PASSWORD` with a password of your choice.
4. Deployments → ⋯ → Redeploy.
