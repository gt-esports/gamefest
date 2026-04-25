# Backend (TypeScript)

## Quick start
- Install deps: `npm install`
- Dev server: `npm run dev` (serves on `PORT`, defaults to 3000)
- Health check: `GET /health`
- API prefix: `/api`

## Runtime modes
- **Local Node server**: `src/index.ts` starts Express with `app.listen(...)` on port 3001.
- **Vercel serverless**: Files in `api/` directory are deployed as functions; the Express app is instantiated from `src/app.ts`.

### Important: Routing for serverless

In a serverless environment, the `/api` prefix is stripped by the infrastructure before reaching the handler. So the Express app receives requests with the `/api` prefix already removed.

To support both local and serverless:
- The app mounts the API router at both `/api` and `/` 
- **Local dev** (`npm run dev`): Requests to `/api/startgg/*` are proxied to localhost:3001, Express matches at `/api`
- **Vercel serverless**: Requests to `/api/startgg/*` reach the handler with path `/startgg/*`, Express matches at `/`

For Vercel deployments, set backend env vars in the Vercel project settings (not only local `.env`).

## start.gg worker
- Env: set `STARTGG_API_TOKEN` (and optionally `STARTGG_API_ENDPOINT`).
- Example endpoint: `GET /api/startgg/tournaments/:slug` (wired to a GraphQL call in `src/services/startggService.ts`).
- Extend `startggService` for more queries and add routes under `src/routes/startgg.ts`.

## Google Form ingestion (batch script)
- Env: `GOOGLE_FORM_SPREADSHEET_ID`, `GOOGLE_FORM_API_KEY`, `GOOGLE_FORM_OUTPUT_PATH` (default `data/google-form.json`).
- Run ad-hoc: `npm run gform:run` (uses Sheets API, writes JSON to the output path).
- Logic lives in `src/scripts/googleFormIngest.ts`; adjust headers/range or output format as needed.

## Layout
- `src/index.ts`: Express bootstrap + router mount.
- `src/config/env.ts`: env parsing.
- `src/routes/`: API routers.
- `src/services/`: external service clients (start.gg).
- `src/scripts/`: batch/cron-like scripts (Google Form ingestion).
