# Backend (TypeScript)

## Quick start
- Install deps: `npm install`
- Dev server: `npm run dev` (serves on `PORT`, defaults to 3001)
- Health check: `GET /health`
- API prefix: `/api`

## Runtime modes
- Local Node server: `src/index.ts` starts Express with `app.listen(...)`.
- Vercel serverless: root `api/index.ts` and `api/[...path].ts` export the same Express app from `src/app.ts`.

For Vercel deployments, set backend env vars in the Vercel project settings (not only local `.env`).

## start.gg worker
- Env: set `STARTGG_API_TOKEN` (and optionally `STARTGG_API_ENDPOINT`).
- Example endpoint: `GET /api/startgg/tournaments/:slug` (wired to a GraphQL call in `src/services/startggService.ts`).
- Extend `startggService` for more queries and add routes under `src/routes/startgg.ts`.

## Layout
- `src/app.ts`: Express app factory and shared app export.
- `src/index.ts`: local Node bootstrap (`app.listen`).
- `src/config/env.ts`: env parsing.
- `src/routes/`: API routers.
- `src/services/`: external service clients (start.gg).
