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
VITE_ESPORTS_API_URL=http://localhost:8000
```

Then run SQL scripts in numerical order from `supabase_scripts/`. Existing
deployments should apply each script they have not yet run. In particular,
`21_seasons.sql` archives existing event records as GameFest 2026 and creates
GameFest 2027 as the active season; review those labels before applying it.
Apply `22_season_admin.sql` next. If an earlier draft of script 22 was applied,
rerun the current version to remove its admin season-creation and name-editing
functions. Admin Settings can edit the active season's start.gg tournament
slug. Admins can view past seasons and their
archived totals and top players, with a link to tournament results on start.gg,
but cannot edit archived
data, change a season's name, or create a season. A maintainer must create and
activate future seasons through a reviewed database migration. New seasons
start with empty registrations, players, games, and challenges;
configure those in the admin panel.
The bracket page loads live start.gg data for the active season's tournament
slug. Leave it blank until that tournament exists.
Apply `23_drop_winners.sql` after script 22 to remove the redundant match
`winners` table. Tournament outcomes come from start.gg; raffle results stay
on `players`.
Apply `24_remove_season_dates.sql` after script 23 to remove the unused season
date columns and replace the admin update function. The older scripts retain
their original definitions for deployments that have already run them.

`staff` / `admin` access is enforced through `public.user_roles` and RLS.

### Hall of Fame API integration

The previous winners section calls the separately hosted
[APIservice](https://github.com/gt-esports/APIservice) endpoint
`GET /v1/gamefest/past-winners`. It no longer queries Supabase directly.
Other pages and authentication still use the existing Supabase configuration.

Set `VITE_ESPORTS_API_URL` to the APIservice origin, or to its base URL when
mounted under a path. Use an absolute HTTP(S) URL without credentials, a query,
or a fragment; the client appends `/v1/gamefest/past-winners`. For example,
`http://localhost:8000` is suitable for local development. Vite reads this value
at startup/build time, so restart Vite or rebuild after changing it. No secret
belongs in a `VITE_*` variable.

Start APIservice separately using its README. Configure its
`GAMEFEST_SUPABASE_URL` and `GAMEFEST_SUPABASE_ANON_KEY` with the existing
GameFest project's public URL and anon/publishable key, and set
`CORS_ALLOWED_ORIGINS=http://localhost:3000` for local Vite access. The existing
Express `/api/*` server still handles start.gg and is unrelated to this request.
To run only the frontend while checking this integration, use `npx vite`.

The response is `{ "seasons": [...] }`, with at most the latest 20 inactive
seasons. Each season has `id`, `name`, `slug`, and up to three `winners`; each
winner has `rank`, `display_name`, and `points`. No user IDs or emails are
needed. The page preserves loading, empty archive, and season-without-results
states. HTTP/network errors, malformed responses, or a ten-second timeout show
a retry button. Missing or invalid configuration shows an unavailable message.
There is no automatic fallback to direct Supabase queries.

Install dependencies with `npm install --legacy-peer-deps` (the existing React
Vite plugin has an older Vite peer range), then verify with:

```bash
npm test
npm run build
npx eslint src/components/PastWinners.tsx src/components/PastWinners.test.tsx src/utils/gamefestApi.ts src/utils/gamefestApi.test.ts --max-warnings 0
```

The repository intentionally ignores `package-lock.json`; the added test
dependencies are pinned in `package.json`.

For release, review and merge the paired APIservice PR first, configure its
Supabase access and allowed frontend origins, deploy it, and verify the public
endpoint. Then configure this project's `VITE_ESPORTS_API_URL` for the target
Vercel environment and test a frontend preview before merging this frontend
PR. Allow the exact preview origin as well as the production origin in the
API's CORS configuration. All PRs still require `@longxiangchen` review before
merging. Reverting this frontend PR restores the previous data path if a
rollback is needed.

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
