# SkillSwap — System Architecture & Technical Specifications

SkillSwap is an algorithmic, zero-currency, reciprocal student skill exchange platform built to connect collegiate peers for equitable barter.

---

## 1. High-Level System Overview

```
                      +-----------------------------------+
                      |   Vite + React 19 Frontend       |
                      |   Academic Editorial Design (Row 3)|
                      +-----------------+-----------------+
                                        |
                            HTTP/REST + HMAC Bearer
                                        |
                      +-----------------v-----------------+
                      |     FastAPI Backend (ASGI)        |
                      |  - Sliding-Window Rate Limiter   |
                      |  - HMAC-SHA256 Token Auth         |
                      |  - Security Headers & Logging     |
                      |  - Exception Normalization        |
                      +---+---------------------------+---+
                          |                           |
            +-------------v-------------+ +-----------v-------------+
            |  Reciprocal Match Engine  | | Database Layer          |
            |  - Skill Normalization    | | - SQLite (WAL mode)     |
            |  - 2-Way Mutual Scoring   | | - Composite Indexes     |
            |  - 3-Person Cycle Finder  | | - Foreign Key Cascades  |
            +---------------------------+ +-------------------------+
```

---

## 2. Reciprocal Matching Engine

### A. Skill Normalization Layer (`normalize.py`)
Incoming raw inputs from students are normalized into canonical skills using a curated alias table:
- Synonyms like `react.js`, `frontend`, `web dev`, `javascript` map to **Web Development**.
- Synonyms like `coding`, `python programming` map to **Python**.
- Unknown skills fall back to Title Casing to guarantee deterministic string equality across users.

### B. Two-Way Mutual Matching (`match_student`)
Matches are categorized into two explicit tiers:
1. **MUTUAL**: True bilateral exchange — Participant A teaches a skill Participant B seeks, and Participant B teaches a skill Participant A seeks.
2. **RELEVANT**: One-directional syllabus alignment where one peer can mentor or learn from the other.

#### Scoring Formula:
$$\text{Score} = 40 \times |\text{give}| + 25 \times |\text{get}| + 35 \times [\text{mutual}] + 5 \times [\text{expert\_mentor}]$$
- Ties are broken deterministically by score descending.

### C. Three-Person Closed Loop Cycle Detection (`find_cycles`)
When no direct mutual swap is available, SkillSwap algorithmically detects 3-person exchange loops ($A \rightarrow B \rightarrow C \rightarrow A$):
- Student $A$ teaches skill $S_1$ wanted by Student $B$.
- Student $B$ teaches skill $S_2$ wanted by Student $C$.
- Student $C$ teaches skill $S_3$ wanted by Student $A$.
- Circular routing ensures zero idle tokens and complete bilateral equity.

---

## 3. Security & Authentication Architecture

1. **HMAC-SHA256 Signed Session Tokens (`auth.py`)**:
   - Format: `v1.<payload_base64>.<signature_base64>`
   - Contains claims: `sub` (student_id), `iat` (issued at), `exp` (expiration), `iss` (`skillswap`).
   - Timing-safe signature verification using `hmac.compare_digest`.
2. **Authorization & Student Ownership**:
   - Proposal creation strictly enforces that `sender_id` matches the token subject.
   - Proposal acceptance and rejection enforce that only the `receiver_id` can decide.
   - Proposal completion verifies that only exchange participants can mark an exchange complete.
3. **Defense-in-Depth Middleware**:
   - Sliding-window rate limiter (120 req/minute per client IP) with standard `Retry-After` headers.
   - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - Restrictive CORS configured via environment variables.

---

## 4. Database Layer & Performance

- **Engine**: SQLite with WAL (`PRAGMA journal_mode = WAL`) and synchronous normal mode for concurrent read/write isolation.
- **Connection Management**: FastAPI dependency `get_db` yields scoped connections closed after each request.
- **Transaction Safety**: Context manager `transaction(conn)` guarantees atomic commit on success and automatic rollback on failure.
- **Indexes**:
  - `idx_skills_student_direction` on `skills(student_id, direction)`
  - `idx_skills_name_direction` on `skills(name, direction)`
  - `idx_requests_sender` on `requests(sender_id)`
  - `idx_requests_receiver` on `requests(receiver_id)`
  - `idx_requests_status` on `requests(status)`

---

## 5. Frontend Architecture

- **Framework**: React 19 + TypeScript + Vite.
- **Aesthetic**: Row 3 Academic Editorial Design with Newsreader serif headings, Manrope functional typography, warm paper backgrounds (`#fbf8fc`), emerald teaching badges, and indigo learning badges.
- **State Management**: Context-driven active student switching with optimistic UI updates and toast feedback.
- **Accessibility**: Full keyboard traps, ARIA dialog roles, accessible naming, and responsive collapsible drawers.
