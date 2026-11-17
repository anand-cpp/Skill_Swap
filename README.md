# SkillSwap — Reciprocal Student Skill Exchange

[![CI](https://github.com/anand-cpp/Mini-Hackathon/actions/workflows/ci.yml/badge.svg)](https://github.com/anand-cpp/Mini-Hackathon/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Equitable knowledge barter, not a static directory.**

SkillSwap algorithmically connects collegiate students to trade skills directly with each other. Rather than one-way tutoring or monetary transactions, it maps the campus skill network to identify **reciprocal barter loops**: peers who teach what you want to learn, AND want to learn what you can teach.

---

## Key Capabilities

- **Skill Normalization Engine**: Curated alias dictionary maps diverse inputs (`react.js`, `frontend`, `web dev`) to canonical ontology (`Web Development`).
- **Two-Way Mutual Match Scoring**: Transparent algorithmic ranking separating 100% reciprocal bilateral swaps from one-way mentor opportunities.
- **Three-Person Circular Barter**: Automatic topological detection of 3-person closed loops ($A \rightarrow B \rightarrow C \rightarrow A$) when direct 2-way swaps are unavailable.
- **Request Lifecycle Clearinghouse**: Real-time state machine tracking proposal dispatch, recipient decision (Accept / Reject), and verified completion.
- **Security & Authorization**: HMAC-SHA256 bearer session tokens, sliding-window rate limiting, HTTP security headers, and strict ownership validation.
- **High-Performance Persistence**: SQLite in WAL mode with connection pooling pragmas and composite database indexes.
- **Stitch Academic Editorial UX**: Responsive design inspired by Google Stitch with Newsreader typography, emerald teaching badges, and indigo learning goals.

---

## System Architecture

See detailed specifications in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
frontend/   Vite + React 19 + TypeScript + Tailwind CSS v4 + Vitest
backend/    FastAPI + SQLite (WAL mode) + Pytest + Uvicorn
deploy/     Docker + Multi-stage Nginx + Docker Compose
```

---

## Quick Start

### Option A: Local Development

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Docker Compose

Spin up the entire production stack (backend API + frontend reverse proxy) with one command:
```bash
docker compose up --build -d
```
Access the application at [http://localhost](http://localhost).

---

## Running Test Suites

### Backend Unit & Integration Tests (73 tests)
```bash
cd backend
pytest tests -v
```

### Frontend Component & Unit Tests (5 tests)
```bash
cd frontend
npm test
```

### TypeScript Validation & Production Build
```bash
cd frontend
npm run build
```

---

## API Reference Surface

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health, DB ping, and latency metrics | No |
| `POST` | `/api/auth/session` | Create HMAC-SHA256 signed bearer token | No |
| `GET` | `/api/students` | List student directory with skill counts | No |
| `GET` | `/api/students/{id}` | Detailed student dossier with skills | No |
| `POST` | `/api/students` | Register student profile with skills | Optional |
| `POST` | `/api/students/{id}/matches` | Bilateral mutual and relevant matches | No |
| `POST` | `/api/students/{id}/cycles` | Triangular 3-person exchange loops | No |
| `GET` | `/api/requests/{id}` | Incoming and outgoing exchange proposals | No |
| `POST` | `/api/requests` | Propose exchange (ownership validated) | Bearer Token / Open |
| `POST` | `/api/requests/{id}/accept` | Accept pending exchange proposal | Recipient Token / Open |
| `POST` | `/api/requests/{id}/reject` | Reject pending exchange proposal | Recipient Token / Open |
| `POST` | `/api/requests/{id}/complete` | Mark accepted exchange as completed | Participant Token / Open |

---

## License

MIT License. See [LICENSE](LICENSE) for details.
