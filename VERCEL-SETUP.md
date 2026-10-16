# ORBIT on Vercel

The original app runs on Cloudflare Workers with D1. A successful static upload
to Vercel does not create that server, so it can return `404 NOT_FOUND`.
The repository now builds a Vercel Node.js function, public assets and routes.
The existing Cloudflare development command continues to work.

## Vercel project settings

- Git repository: `shoxrux719/Orbit-V2`, production branch `main`.
- Root Directory: the repository root (leave empty).
- Framework Preset: **Other**.
- Build Command: `npm run build` (configured in `vercel.json`).
- Install Command: `npm ci --include=dev`.
- Output Directory: leave the override disabled. The build creates the
  standard `.vercel/output` structure with a function and static assets.
- Node.js: **22.x**, as specified by `package.json`.

After the fix reaches GitHub, Vercel's Git integration should deploy that commit.
If the old 404 remains, open Deployments and redeploy the latest commit,
checking that the project Root Directory points to this repository root.

## Permanent database

The local `.wrangler/state` database is private and stays on your computer.
Vercel needs a remote database. The adapter supports Turso/libSQL over HTTPS,
preserving the existing SQL, phone login, roles, classes, grades and homework.
The adapter's `batch` uses database transactions, including rollback on failure.

1. Create a database in Turso (or connect it through Vercel Storage).
2. Put `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` into the Vercel project's
   Environment Variables. Do not commit these values or send them in chat.
3. For one-time database preparation, copy `.env.production.example` to
   `.env.production.local` on your computer. Enter the same database URL/token,
   an administrator login and a private administrator password of 12–200 characters.
4. With Node.js 22 or newer, run:

   ```powershell
   npm run production:setup
   ```

5. Redeploy the project so Vercel receives the database environment variables.

The setup command applies seven versioned migrations and creates the first
administrator only if none exists. Repeating it preserves the existing password
and data. It does not upload the local student database. The production database
starts empty; transferring existing student data is a separate, explicit action.
There is no public setup endpoint and no default production password.

Only the database URL/token belong in Vercel runtime settings. The one-time
administrator password can stay in the ignored local setup file; it is hashed
before insertion and is never put into the browser or build output.

Without database settings, the sign-in screen is available and protected API
calls return an explicit `503` setup error. This is not a working-account demo:
real login requires the remote database and initial administrator setup.

## Local verification of the Vercel adapter

```powershell
npm run test:vercel
node deployment/preview.mjs
```

The preview is at `http://127.0.0.1:3001` and uses the built Vercel function.
It does not automatically connect the existing local D1 database.

Seven adapter tests cover SSR, routes, cookies, origin checks, role isolation,
legacy learning results, request context isolation, atomic database writes,
idempotent migrations and public/private build separation. The existing 31 tests
can still be run using `npm test`.
