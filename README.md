# gtesports-gamefest

This is the repository for the Georgia Tech Esports Tournament Management App (for Game Fest)

This app is developed using React, Tailwind, and Vite.

This branch runs in a serverless mode: frontend routes `/api/*` calls directly to
Supabase using a client-side API bridge.
## Quick Setup for Developers

Clone the repository and run the following command:

```
npm i
```

To run the application, use:

```
npm run dev
```

For Supabase-backed auth/data, set these env vars in `.env.local`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then run SQL scripts in order from `supabase_scripts/`:

1. `00_initial_schema.sql`
2. `01_serverless_rls.sql`

`staff` / `admin` access is enforced via RLS using
`auth.jwt() -> app_metadata -> role`.

Happy coding! 

## Vercel (single project) serverless setup

### Step-by-step deployment

1. **Import into Vercel**: Go to [vercel.com](https://vercel.com), click "New Project", and select this repository.

2. **Framework & Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install` (default)

3. **Environment Variables** (in Project Settings → Environment Variables):
   - `STARTGG_API_TOKEN` — required for Start.gg bracket integration
   - `STARTGG_API_ENDPOINT` (optional) — defaults to `https://api.start.gg/gql/alpha`
   - Any frontend `VITE_*` vars (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

4. **Deploy** — Vercel auto-detects the `api/` directory and deploys serverless functions.

### How it works

- **Frontend** (Vite static): Served at `/` and `/assets/*`
- **Backend API** (serverless functions): Files in `api/` directory are auto-deployed as functions
  - `/api/[...path].ts` handles all `/api/*` routes
  - Routes internally to Express app in `backend/src/app.ts`
- **SPA Routing**: Non-API routes rewrite to `index.html` for client-side routing
- **Same Domain**: Frontend and backend share the same domain (no CORS needed)

### Troubleshooting

- **404 errors on `/api/*` calls**: Ensure `STARTGG_API_TOKEN` is set in Vercel environment variables and the serverless functions were built successfully.
- **Cold starts**: First request to an API endpoint may be slow (typical Vercel serverless behavior).
- **Local testing**: Use `npm run dev` in root (frontend) and `cd backend && npm run dev` (backend) with Vite proxy to test before deploying.

Please use the [Project Board](https://github.com/orgs/gt-esports/projects/3) to see what needs to be done and in general follow the Figma below. Anyone can assign/create any issues just make sure @longxiangchen reviews any pull request before merging.

Figma: https://www.figma.com/design/TtT5bhCALzVQwCiHiJUfLH/Midfi?node-id=0-1&p=f&t=PtHX77VUp1cWRrY3-0

If you have any suggestions for the Figma feel free to discuss them in the GT Esports administration discord under the development department tab.
