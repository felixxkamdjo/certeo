# Certeo - Management Platform

Welcome to the **Certeo** project monorepo. This project brings together the backend application (.NET 10) and the frontend application (Angular/pnpm).

---

## Project Architecture

The project is structured as a **Monorepo** combining a **Modular Monolith** on the backend side and an **SPA** on the frontend side.

```text
certeo/
├── backend/                  - Backend Application (.NET 10)
│   ├── src/
│   │   ├── Certeo.Gateway/   - Reverse Proxy & Entry Point (Port 5000)
│   │   └── Certeo.Api/       - Modular Monolith (Port 5001)
│   ├── Certeo.sln            - .NET Solution
│   └── global.json           - Pinned .NET SDK version
├── frontend/                 - Frontend Application (Angular + pnpm)
├── docker-compose.yml        - Backend orchestration for Dev
└── README.md
```

### Role of Backend Components

- **Certeo.Gateway**: Single entry point of the system. Receives all requests from the Frontend, handles CORS, and routes them to the internal modules.
- **Certeo.Api**: Contains all the business logic and data access, split into functional modules.

---

## Quick Start Guide

### Prerequisites

- **Backend**: Docker Engine & Docker Compose (or the .NET 10 SDK)
- **Frontend**: Node.js (v24.16.0), Angular (v22.9.5) & pnpm

### 1. Start the Backend (Docker)

The backend (Gateway + API) runs in isolated containers:

```bash
# From the monorepo root
docker compose up --build
```

- Gateway (Frontend URL): http://localhost:5000
- Direct API / Swagger: http://localhost:5001/swagger

### 2. Start the Frontend (Local)

The frontend does not run under Docker, in order to keep fast Hot-Reloading:

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm start
```

- Web Application: http://localhost:4200

The frontend communicates directly with the Gateway at `http://localhost:5000`.

---

## Git Strategy & Workflows

To ensure smooth collaboration and avoid conflicts, we follow the convention below.

### Main Branches

- **main**: Production branch (stable, tested code).
- **develop**: Main daily integration branch. All features are merged here.

### Development Workflow

**1. Pull the latest updates from `develop`**

```bash
git checkout develop
git pull origin develop
```

**2. Create a feature branch**

Every new task must be developed on a dedicated branch created from `develop`:

- Required format: `feature/feature-name`

```bash
# Example
git checkout -b feature/login-jwt
```

**3. Work and commit your changes**

Write clear, explicit commits:

```bash
git add .
git commit -m "feat(auth): add login endpoint"
```

**4. Push your branch to GitHub**

```bash
git push -u origin feature/feature-name
```

**5. Open a Pull Request (PR)**

- Open a PR on GitHub from your `feature/...` branch to the `develop` branch.
- Request at least one code review before merging.
- Once the PR is merged, you can delete your remote branch.