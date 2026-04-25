# gtesports-gamefest

This is the repository for the Georgia Tech Esports Tournament Management App (for Game Fest)

This app is developed using React, Tailwind, and Vite.

This project can run as a single Vercel project with:
- Frontend (Vite static build)
- Backend serverless API routes under `/api/*`

The backend serverless entrypoints are:
- `api/index.ts`
- `api/[...path].ts`

Both delegate to the Express app in `backend/src/app.ts`.
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

## Vercel (single project) setup

1. Import this repo into Vercel as one project.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables in Vercel Project Settings:
	- `STARTGG_API_TOKEN`
	- `STARTGG_API_ENDPOINT` (optional)
	- any frontend `VITE_*` variables you need.
6. Deploy.

Notes:
- `vercel.json` already preserves `/api/*` and rewrites non-API routes to `index.html` for SPA routing.
- Frontend can call relative API paths (for example, `/api/startgg/...`) on the same domain.

Please use the [Project Board](https://github.com/orgs/gt-esports/projects/3) to see what needs to be done and in general follow the Figma below. Anyone can assign/create any issues just make sure @longxiangchen reviews any pull request before merging.

Figma: https://www.figma.com/design/TtT5bhCALzVQwCiHiJUfLH/Midfi?node-id=0-1&p=f&t=PtHX77VUp1cWRrY3-0

If you have any suggestions for the Figma feel free to discuss them in the GT Esports administration discord under the development department tab.
