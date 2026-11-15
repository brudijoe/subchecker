# subchecker
Check availability for certain subs on youtube

## Local development

Install dependencies once in each project, then start both development servers
from the repository root:

```powershell
npm install
npm install --prefix subchecker-backend
npm install --prefix subchecker-web-app
npm run dev
```

This starts the backend and frontend together. Press `Ctrl+C` to stop both.
You can also start only one with `npm run dev:backend` or
`npm run dev:frontend`.

Before starting the backend for the first time, configure its `.env` and
initialize the database as described in [subchecker-backend/README.md](./subchecker-backend/README.md):

```powershell
docker compose --env-file subchecker-backend/.env --file subchecker-backend/docker-compose.yml up -d db
npm --prefix subchecker-backend run db:push
```

The commands above are run from the repository root. Alternatively, start
PostgreSQL and the backend from `subchecker-backend`:

```powershell
Copy-Item .env.example .env
# Fill in the database and ntfy values in .env.
docker compose up -d db
npm install
npm run db:push
npm run dev
```

In a second terminal, start the frontend from `subchecker-web-app`:

```powershell
npm install
npm run dev
```

The Vite development server proxies `/links` and `/health` to the local backend.

## Raspberry Pi deployment

The Pi deployment builds ARM64 images on the Raspberry Pi through Ansible. The
production frontend is served by Nginx, which proxies the API to the backend;
PostgreSQL data is stored in a persistent Docker volume. The backend and
database are not published directly to the network.

Configure the encrypted Ansible vault as described in the `homelab` README,
then deploy from the `homelab` directory:

```bash
ansible-galaxy collection install -r ./ansible-pi-docker/requirements.yml
ansible-playbook ./ansible-pi-docker/site.yml
```

The app will be available at `http://<raspberry-pi-address>:5173` (or the
configured `subchecker_host_port`). The Ansible role updates the checkout,
rebuilds the images, waits for PostgreSQL, applies the Drizzle schema, and
recreates the containers.
