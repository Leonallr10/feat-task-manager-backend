# Task Manager API

Multi-user Task Management API with authentication, role-based access, and analytics — built with **NestJS** in an **Nx monorepo**. Uses **Azure Cosmos DB (Mongo API)** or MongoDB, **JWT + Passport**, and **Docker** for local and deployable setups.

---

## What’s implemented (and where)

| Feature | Location |
|--------|----------|
| **Auth** – register, login, JWT, guards, roles (USER / ADMIN) | `libs/src/lib/auth/`, `apps/api/src/app/auth.controller.ts` |
| **Users** – schema, repository, service | `libs/src/lib/users/`, `libs/src/lib/data-access/schemas/user.schema.ts` |
| **Tasks** – CRUD, owner/admin rules, status filter | `libs/src/lib/tasks/`, `libs/src/lib/data-access/schemas/task.schema.ts` |
| **Analytics** – per-status counts, avg completion time, per-user counts (admin only) | `libs/src/lib/analytics/` |
| **Persistence** – Mongoose + Cosmos/Mongo | `libs/src/lib/data-access/` (MongoModule, repositories, schemas) |
| **Shared** – DTOs, enums, validation pipe, exception filter | `libs/src/lib/models/`, `libs/src/lib/utils/` |
| **Unit tests** – services, guards | `apps/api/src/*.spec.ts` (e.g. `tasks.service.spec.ts`, `roles.guard.spec.ts`) |
| **Integration tests** – controllers + HTTP (mocked DB) | `apps/api/src/app/app.integration.spec.ts` |
| **Docker** – API image + Mongo for local dev | `Dockerfile`, `docker-compose.yml` |

**API base:** `http://localhost:3000/api`  
**Endpoints:** `POST/GET /auth/register`, `/auth/login` · `POST/GET/PUT/DELETE /tasks` · `GET /analytics/tasks` (admin).

---

## Commands you need

All commands below are run from the **project root** (`task-manager/`).

### 1. Application startup (local, no Docker)

```bash
# Install dependencies (once)
npm install

# Optional: set env (or use defaults)
# Windows (PowerShell):  $env:MONGO_URI = "mongodb://localhost:27017/task-manager"
# Windows (PowerShell):  $env:JWT_SECRET = "your-secret"

# Start the API (dev server with watch)
npm start
# or
npx nx serve api
```

- API: **http://localhost:3000/api**
- Ensure MongoDB is running locally on `27017`, or set `MONGO_URI` / `COSMOS_MONGO_URI`.

---

### 2. Jest testing

```bash
# Run all tests (api project)
npm test
# or
npx nx test api

# Run tests with coverage report (≥70% per PRD)
npm run test:cov
# or
npx nx test api --coverage
```

- Config: `apps/api/jest.config.cts`
- Unit specs: `apps/api/src/*.spec.ts` (e.g. `tasks.service.spec.ts`, `auth.service.spec.ts`, `roles.guard.spec.ts`).
- Integration specs: `apps/api/src/app/app.integration.spec.ts`.

---

### 3. Docker (local + deployable image)

```bash
# Build and run API + Mongo with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

- API: **http://localhost:3000/api**
- Mongo: `mongodb://localhost:27017` (or `mongodb://mongo:27017/task-manager` from inside the API container).
- Image is suitable for deployment (e.g. Azure Container Apps, AKS); override `MONGO_URI`/`COSMOS_MONGO_URI` and `JWT_SECRET` in production.

---

### 4. Build (production bundle)

```bash
npm run build
# or
npx nx build api
```

Output: `dist/apps/api/` (used by Docker and for production runs).

---

## Quick reference

| Goal | Command |
|------|--------|
| Install deps | `npm install` |
| Start API (local) | `npm start` or `npx nx serve api` |
| Run tests | `npm test` or `npx nx test api` |
| Tests + coverage | `npm run test:cov` or `npx nx test api --coverage` |
| Run with Docker | `docker-compose up --build` |
| Production build | `npm run build` or `npx nx build api` |

---

## Environment variables

| Variable | Description | Default (if any) |
|----------|-------------|-------------------|
| `MONGO_URI` or `COSMOS_MONGO_URI` | MongoDB / Cosmos (Mongo API) connection string | `mongodb://localhost:27017/task-manager` |
| `JWT_SECRET` | Secret for signing JWTs | (none; set in production) |
| `PORT` | HTTP port | `3000` |

---

## Nx workspace

- **Apps:** `apps/api` (NestJS API).
- **Libs:** `libs/src/lib/` — auth, models, data-access, tasks, users, analytics, utils.
- Run `npx nx graph` to view the project graph.
