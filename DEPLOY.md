# Deploying API Sentinel v3 (step by step, first time)

You will use **three free services**. Each one does one job:

| Part | What it is | Where it lives | Why there |
|---|---|---|---|
| Database | PostgreSQL, stores every check | **Neon** | Free plan never expires (Render's free database expired after 30 days) |
| Backend | FastAPI + the 60-second scheduler | **Render** | Needs a program that keeps running |
| Frontend | The React website | **Vercel** | Best at serving websites |

> Neon is **only the database**. It cannot run Python, so the backend still runs on Render.
> Render just connects to Neon instead of its own database.

Do the steps **in this order**: Neon, then Render, then Vercel, then the CORS step at the end.

---

## Step 0: Push the project to GitHub

1. Unzip `api-sentinel-v3.zip` onto your **D drive**, for example `D:\projects\api-sentinel-v3`.
2. On github.com click **New repository**, name it `api-sentinel-v3`, keep it **Public**, do **not** add a README. Click **Create repository**.
3. Open the folder in VS Code, open the terminal (**Ctrl + `**) and run:

```
git init
git add .
git commit -m "API Sentinel v3: new UI, Neon database, resilient startup"
git branch -M main
git remote add origin https://github.com/anu091104/api-sentinel-v3.git
git push -u origin main
```

Refresh the GitHub page. You should see the `backend`, `frontend` and `docs` folders.

---

## Step 1: Create the database on Neon (about 3 minutes)

1. Go to **https://neon.com** and click **Sign up**. Choose **Continue with GitHub** (easiest).
2. Neon asks you to create your first **project**. Fill in:
   - **Project name:** `api-sentinel`
   - **Postgres version:** leave the default
   - **Cloud provider:** AWS
   - **Region:** **Asia Pacific (Singapore)**. Pick this because the Render backend will also be in Singapore, so they talk quickly.
3. Click **Create project**. Neon creates a database called `neondb` for you.
4. On the project page click the **Connect** button (top right of the dashboard).
5. A box opens with a **connection string**. Make sure:
   - Database: `neondb`
   - **Connection pooling: ON** (the default is fine)
6. Click **Show password**, then **Copy snippet**. It looks like this:

```
postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

7. Paste it into Notepad for now. **This string is a password: never commit it to GitHub.**

You don't need to create any tables. The backend creates them automatically the first time it connects.

---

## Step 2: Deploy the backend on Render (about 5 minutes)

**First clean up the old version** (it keeps crashing because its database expired):

1. Go to **dashboard.render.com**.
2. Open **api-sentinel-backend** (the old one), then **Settings**, scroll down, and click **Delete Web Service**.
3. Open **api-sentinel-db**, then **Settings**, and click **Delete Database**.

**Now deploy v3:**

1. Click **New +**, then **Blueprint**.
2. Connect your GitHub if asked, then pick the **api-sentinel-v3** repository and click **Connect**.
3. Render reads `render.yaml` and shows one service: **api-sentinel-v3-backend**. It asks for two values:
   - **DATABASE_URL:** paste the Neon connection string from Step 1.
   - **CORS_ORIGINS:** type `*` for now. You will tighten this in Step 4.
4. Click **Apply** (or **Deploy Blueprint**).
5. Wait 3 to 5 minutes until the service shows **Live**.
6. Copy the service URL at the top, for example `https://api-sentinel-v3-backend.onrender.com`.

**Test it.** Open these in your browser:

- `https://YOUR-BACKEND.onrender.com/health` should show `{"status":"ok","database":"ok"}`
- `https://YOUR-BACKEND.onrender.com/docs` should show the Swagger page

If `/health` says `"database":"unavailable"`, the Neon string is wrong. Go to **Environment**, fix `DATABASE_URL`, and save.

---

## Step 3: Deploy the frontend on Vercel (about 3 minutes)

1. Go to **vercel.com** and click **Add New...**, then **Project**.
2. **Import** the `api-sentinel-v3` repository.
3. On the configure screen:
   - **Root Directory:** click **Edit** and choose **`frontend`** (important!)
   - **Framework Preset:** Vite (detected automatically)
   - **Environment Variables:** add
     - Name: `VITE_API_BASE`
     - Value: your Render URL from Step 2, **without a slash at the end**, e.g. `https://api-sentinel-v3-backend.onrender.com`
4. Click **Deploy**. After about a minute you get a link like `https://api-sentinel-v3.vercel.app`.

Open it. Click **Open Monitor**, then click one of the example APIs. A card should appear within a few seconds.

> If you ever change `VITE_API_BASE`, you must **Redeploy** on Vercel. Vite bakes the value in at build time.

---

## Step 4: Lock CORS to your website (1 minute)

Right now any website can call your backend. Allow only yours:

1. Render: open **api-sentinel-v3-backend**, then **Environment**.
2. Edit **CORS_ORIGINS** and set it to your exact Vercel URL, **no slash at the end**:
   `https://api-sentinel-v3.vercel.app`
3. Click **Save Changes**. Render redeploys by itself.
4. Refresh your Vercel site. It should still work.

---

## Things that are normal (not bugs)

| What you see | Why | What to do |
|---|---|---|
| "Waking up the server" for up to a minute | Render's free plan sleeps after 15 minutes without visitors | Nothing: the page retries by itself |
| "Server is up, database is waking" for a few seconds | Neon's free plan sleeps after 5 idle minutes | Nothing: it answers within seconds |
| Spotify / YouTube show **Down** | They need a login, so they answer 401/403, not 200 | Set "Healthy status code" to 401 when adding them |
| `{"detail":"Not Found"}` on some URL | That path doesn't exist on the backend | Use `/`, `/health` or `/docs` |
| The site won't open on your Wi-Fi but works on mobile data | Some Indian internet providers block `vercel.app` | Change DNS to 1.1.1.1, or test on mobile data |

### Should I keep the backend awake 24/7 with a pinger?

**Not recommended on free plans.** If the backend never sleeps, the scheduler queries Neon every
minute, so Neon never sleeps either. That would use up Neon's free monthly compute hours in about two
weeks. Then the database pauses until the next month, and you're back to an error. Letting it sleep
when nobody is looking is the stable choice for a portfolio demo.

---

## If something fails

1. Render, then **api-sentinel-v3-backend**, then **Logs**. Read the last red lines.
2. Open `/health` on the backend: is `database` `ok`?
3. In the Vercel site press **F12**, then the **Console** tab, for frontend errors (CORS errors show up here).
