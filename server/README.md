# CareerOS Backend

The production-ready monolithic backend for **CareerOS** - the AI-powered career operating system for college students.

## Architecture

This application is built using a **Modular Monolith** pattern. Instead of a messy web of microservices, all domains exist in one scalable Node.js application, cleanly separated into strictly-typed modules.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: Strict TypeScript
- **Database**: PostgreSQL (with `pgvector` for AI embeddings)
- **ORM**: Prisma (v7)
- **Validation**: Zod
- **AI Provider**: Google Gemini

### Core Modules (`src/modules/`)
1. **`auth`**: Secure JWT & HTTP-Only Cookie session management, Argon2 hashing, Google OAuth.
2. **`profiles`**: Student profiles, education history, and career goals.
3. **`onboarding`**: Strict state-machine enforcing the 5-step user onboarding flow.
4. **`skills`**: Master skills database and dynamic user skill-gap calculations.
5. **`roadmap`**: Deterministic generation of step-by-step career roadmaps based on skill gaps.
6. **`opportunities`**: Job/Internship board with smart matching algorithms (Readiness Scores).
7. **`github`**: Frictionless REST fetching of public repositories to act as verifiable proof-of-work.
8. **`community`**: Peer matchmaking algorithm, LinkedIn-style connections, and an activity feed.
9. **`ai`**: True Retrieval-Augmented Generation (RAG) using Gemini and `pgvector` to chat with study PDFs, plus a personalized AI Career Mentor.

## Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL database **with the `pgvector` extension installed**.
  *(If using Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg16`)*

### 1. Environment Setup
Create a `.env` file in the `server/` root:
```env
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careeros?schema=public"

JWT_SECRET="super-secret-key"
JWT_REFRESH_SECRET="super-secret-refresh-key"

GEMINI_API_KEY="your-gemini-key"
```

### 2. Install & Migrate
```bash
npm install
npx prisma migrate dev
```

### 3. Run the Server
```bash
npm run dev
```

## Production Deployment (Docker)

This repository includes a multi-stage `Dockerfile` and a `docker-compose.yml` that seamlessly orchestrates the Node API alongside a fresh `pgvector` database.

1. Ensure your `.env` variables (specifically `GEMINI_API_KEY`) are exported to your shell or configured in your deployment platform.
2. Run Docker Compose:
```bash
docker compose up --build -d
```
3. Run the initial database migration inside the container:
```bash
docker exec -it careeros_api npx prisma migrate deploy
```

The API will be live at `http://localhost:3000`.
