# Deploy Shortlist: Render + Neon

This guide deploys the React build and Express API together on one Render **Web Service**, with PostgreSQL hosted on Neon. It does not require separate frontend and backend URLs.

## 1. Put the project on GitHub

Create a new repository such as `shortlist`. Upload the **contents of the extracted shortlist folder**, so `package.json` is at the repository root.

Include `client`, `server`, `scripts`, `docs`, `package.json`, `package-lock.json`, `.env.example`, `.gitignore` and `render.yaml`.

Do not upload `.env`, `node_modules`, your database connection string or a generated session secret. `.gitignore` already excludes these files. Do not upload the ZIP itself instead of extracting it.

## 2. Create a fresh Neon database

1. Sign in at https://console.neon.tech and create a new project for Shortlist.
2. Choose a region near your Render service.
3. Open the project's **Connect** dialog.
4. Choose the database and role, enable connection pooling if available, and copy the PostgreSQL connection string.
5. Keep the full string, including its SSL query parameters. Do not paste it into chat or into a frontend file.

The application uses the standard `pg` driver. Both normal PostgreSQL and Neon are supported. The connection string supplies TLS configuration.

## 3. Create a Render Web Service

1. Sign in at https://dashboard.render.com.
2. Choose **New → Web Service**.
3. Connect the GitHub repository you just created.
4. Enter these settings:

| Field | Value |
| --- | --- |
| Name | Any available name, for example `shortlist-abir` |
| Language / Runtime | Node |
| Branch | main, or your repository's default branch |
| Root Directory | Leave blank if package.json is at the repository root |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run db:migrate && npm start` |
| Health Check Path | `/api/health` |
| Instance Type | Free for a portfolio demo, or a paid instance if you need it always awake |

The start command creates tables before launching the server. It is safe to run again and does not reset your records. The build itself does not connect to the database.

## 4. Add environment variables

Create these **four variables** in Render. In a key/value form, put the name in Key and only its value in Value. Do not add surrounding quotes or paste `KEY=` into a Value field.

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Your complete Neon PostgreSQL connection string |
| `SESSION_SECRET` | A newly generated random secret of at least 32 characters |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `24.22.1` |

Generate SESSION_SECRET locally with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy its output directly into Render. Keep this secret stable across redeployments; replacing it signs everyone out. Render supplies `PORT` automatically. No `VITE_API_URL`, `BETTER_AUTH_URL`, OAuth credentials or SQLite path is needed.

## 5. Deploy and check

1. Click **Create Web Service / Deploy**.
2. Wait for the build and the database setup to finish successfully.
3. Open the exact `https://...onrender.com` address shown by Render.
4. Create your own account and sign in.
5. Load sample applications, edit one, save it and refresh the page.
6. Check the interview room and confirm your preparation answer remains saved.
7. Sign out and back in; verify your entries remain.
8. Open the same site in a private window, create another test account and confirm it has a separate empty workspace.
9. Copy the actual working public URL into your portfolio. Do not use a dashboard/admin URL as the live link.

## Optional: use the included Blueprint

Instead of entering settings manually, choose **New → Blueprint** and connect this repository. `render.yaml` supplies the build/start commands and generates SESSION_SECRET. It asks you for DATABASE_URL. Review the plan before confirming creation. Use either the manual route or the Blueprint route, not both.

## Costs and availability

Free Render web services can sleep after 15 minutes without traffic; the next visit can take about a minute to wake them. This matters when an examiner opens your live link. Free tiers have usage limits and providers may change their terms. Review the current plan screens before creating services.

Do not rely on a SQLite file inside Render: local service files are ephemeral. This project stores application data and sessions in PostgreSQL. The recommended database is Neon rather than Render's expiring free PostgreSQL offering.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Missing DATABASE_URL | Add the variable to the Web Service, not to React or a static-site service |
| Password authentication / connection failure | Recopy the full connection string from Neon; confirm the database is active |
| “relation users does not exist” | Use the complete start command, including `npm run db:migrate` |
| Sign-in works locally but not on Render | Use the HTTPS public URL, NODE_ENV=production and a stable SESSION_SECRET |
| “Your session changed” | Refresh, then retry; signing in/out in another tab can invalidate the old CSRF token |
| White screen or route refresh 404 | Deploy as Web Service, run the build, and start Express; do not deploy client source as a static site |
| Blank root page locally | Run `npm run dev` and open localhost:5173, or build first and then open localhost:3001 |
| First page is slow | A free service/database may be waking up; check the Render log if it does not recover |
| npm cannot find package.json | Open the terminal in the extracted project folder, not its parent |

## Docker alternative

The Dockerfile builds React and starts Express as a non-root user. Supply DATABASE_URL and SESSION_SECRET as runtime environment variables. Production cookies require HTTPS, normally provided by your hosting proxy. The Docker path is included but was not executed in the build environment.

## Official references (checked 29 October 2026)

- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/your-first-deploy
- https://render.com/docs/free
- https://neon.com/docs/get-started/connect-neon

The project was built and tested locally. A live Render/Neon deployment has not been performed or verified because it requires your own accounts and database configuration.
