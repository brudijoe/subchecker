# Backend setup

These steps set up the backend, its PostgreSQL database, and ntfy notifications on your computer.

## 1. Create your environment file

In this folder, make a copy of `.env.example` and name the copy `.env`. For example, in PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in the values. The database settings below are an example for running the database with the included Docker Compose file:

```dotenv
DATABASE_URL=postgres://postgres:choose-a-password@localhost:5432/subchecker
DB_USER=postgres
DB_PASSWORD=choose-a-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subchecker
NTFY_TOPIC=choose-a-long-random-topic-name
```

Use the same password in `DATABASE_URL` and `DB_PASSWORD`. The app connects using `DATABASE_URL`; Docker Compose uses `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to create the database. `DB_HOST` and `DB_PORT` describe the local database address. If your password contains special characters, URL-encode them in `DATABASE_URL`.

## 2. Set up ntfy notifications

ntfy delivers messages to a topic. Choose a long, hard-to-guess topic name and put it in `NTFY_TOPIC` in `.env`. The default ntfy server is `https://ntfy.sh`, so no account or extra server setup is needed. Anyone who knows the topic name may be able to read its messages, so do not use a predictable name or send sensitive information in notifications.

To receive the messages, open `https://ntfy.sh/<your-topic-name>` in a browser, replacing `<your-topic-name>` with the exact value of `NTFY_TOPIC`. You can also subscribe to that topic in the ntfy mobile or desktop app. The backend sends a notification when it finds English subtitles for a saved video. It checks saved videos when it starts and then every six hours.

## 3. Start the database and backend

Run these commands from this folder after filling in `.env`:

```powershell
docker compose up -d db
npm install
npm run db:push
npm run dev
```

`docker compose up -d db` starts PostgreSQL in the background. `npm run db:push` creates or updates the database tables. `npm run dev` starts the backend at `http://localhost:3000`.

Keep `.env` private. It contains your database password and is ignored by Git; do not commit it. `.env.example` is the safe template to share.
