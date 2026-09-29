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

Then run SQL scripts in numerical order from `supabase_scripts/`. Existing
deployments should apply each script they have not yet run. In particular,
`21_seasons.sql` archives existing event records as GameFest 2026 and creates
GameFest 2027 as the active season; review those labels before applying it.
Apply `22_season_admin.sql` next. Admin Settings can edit the active season's
name, dates, and start.gg tournament slug or start a new season. Older seasons
remain visible but read-only. New seasons start with empty registrations,
players, games, challenges, and winners; configure those in the admin panel.
The bracket page loads live start.gg data for the active season's tournament
slug. Leave it blank until that tournament exists.

`staff` / `admin` access is enforced through `public.user_roles` and RLS.

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
