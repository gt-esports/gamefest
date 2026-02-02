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

Please use the [Project Board](https://github.com/orgs/gt-esports/projects/3) to see what needs to be done and in general follow the Figma below. Anyone can assign/create any issues just make sure @longxiangchen reviews any pull request before merging.

Figma: https://www.figma.com/design/TtT5bhCALzVQwCiHiJUfLH/Midfi?node-id=0-1&p=f&t=PtHX77VUp1cWRrY3-0

If you have any suggestions for the Figma feel free to discuss them in the GT Esports administration discord under the development department tab.
