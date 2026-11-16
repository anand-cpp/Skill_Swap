import sqlite3
import time
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .db import get_conn, get_db, init_db, transaction
from .logging_config import logger
from .matching import find_cycles, match_student
from .normalize import normalize

init_db()

app = FastAPI(
    title="SkillSwap API",
    description="Reciprocal peer-to-peer student skill exchange clearinghouse API.",
    version="2.0.0",
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error": {
                "code": exc.status_code,
                "message": str(exc.detail),
                "path": request.url.path,
            },
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0]["msg"] if errors else "Validation error"
    return JSONResponse(
        status_code=422,
        content={
            "detail": errors,
            "error": {
                "code": 422,
                "message": first_msg,
                "details": errors,
                "path": request.url.path,
            },
        },
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": {
                "code": 500,
                "message": "Internal server error occurred.",
                "path": request.url.path,
            },
        },
    )

@app.middleware("http")
async def log_requests_and_timing(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time"] = f"{duration_ms:.2f}ms"
    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f}ms)"
    )
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SkillIn(BaseModel):
    name: str = Field(min_length=1)
    category: str = "other"
    direction: str = Field(pattern="^(teach|learn)$")
    level: str = "intermediate"


class StudentIn(BaseModel):
    name: str = Field(min_length=1)
    college: str = Field(min_length=1)
    bio: str = ""
    skills: list[SkillIn] = []


class RequestIn(BaseModel):
    sender_id: int
    receiver_id: int
    teach_skill_id: int
    learn_skill_id: int


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/students", status_code=201)
def create_student(payload: StudentIn, conn: sqlite3.Connection = Depends(get_db)):
    with transaction(conn):
        cur = conn.execute(
            "INSERT INTO students (name, college, bio) VALUES (?,?,?)",
            (payload.name.strip(), payload.college.strip(), payload.bio.strip()),
        )
        sid = cur.lastrowid
        for s in payload.skills:
            conn.execute(
                "INSERT INTO skills (student_id, name, category, direction, level) VALUES (?,?,?,?,?)",
                (sid, normalize(s.name), s.category.strip(), s.direction, s.level),
            )
    return fetch_student(sid, conn)


@app.get("/api/students")
def list_students(conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT s.id, s.name, s.college, s.bio, "
        "COUNT(CASE WHEN sk.direction='teach' THEN 1 END) AS teach_count, "
        "COUNT(CASE WHEN sk.direction='learn' THEN 1 END) AS learn_count "
        "FROM students s LEFT JOIN skills sk ON sk.student_id=s.id GROUP BY s.id ORDER BY s.name"
    ).fetchall()
    return [dict(r) for r in rows]


@app.get("/api/students/{sid}")
def get_student(sid: int, conn: sqlite3.Connection = Depends(get_db)):
    return fetch_student(sid, conn)


def fetch_student(sid: int, conn: sqlite3.Connection):
    row = conn.execute(
        "SELECT id, name, college, bio FROM students WHERE id=?", (sid,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")
    skills = conn.execute(
        "SELECT id, name, category, direction, level FROM skills WHERE student_id=? ORDER BY direction, name",
        (sid,),
    ).fetchall()
    return {**dict(row), "skills": [dict(s) for s in skills]}


@app.post("/api/students/{sid}/matches")
def get_matches(sid: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT id FROM students WHERE id=?", (sid,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")
    matches = match_student(sid)
    return {"student_id": sid, "matches": matches, "mutual_count": sum(1 for m in matches if m["type"] == "MUTUAL")}


@app.post("/api/students/{sid}/cycles")
def get_cycles(sid: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT id FROM students WHERE id=?", (sid,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")
    cycles = find_cycles(sid)
    return {"student_id": sid, "cycles": cycles, "cycle_count": len(cycles)}


@app.post("/api/requests", status_code=201)
def create_request(payload: RequestIn, conn: sqlite3.Connection = Depends(get_db)):
    if payload.sender_id == payload.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot request yourself")
    
    teach = conn.execute(
        "SELECT id FROM skills WHERE id=? AND student_id=? AND direction='teach'",
        (payload.teach_skill_id, payload.sender_id),
    ).fetchone()
    if teach is None:
        raise HTTPException(status_code=400, detail="teach_skill_id must be a 'teach' skill belonging to the sender")
    learn = conn.execute(
        "SELECT id FROM skills WHERE id=? AND student_id=? AND direction='learn'",
        (payload.learn_skill_id, payload.sender_id),
    ).fetchone()
    if learn is None:
        raise HTTPException(status_code=400, detail="learn_skill_id must be a 'learn' skill belonging to the sender")
    dup = conn.execute(
        "SELECT id FROM requests WHERE sender_id=? AND receiver_id=? AND status='pending'",
        (payload.sender_id, payload.receiver_id),
    ).fetchone()
    if dup:
        raise HTTPException(status_code=409, detail="Request already pending")
    
    with transaction(conn):
        cur = conn.execute(
            "INSERT INTO requests (sender_id, receiver_id, teach_skill_id, learn_skill_id) VALUES (?,?,?,?)",
            (payload.sender_id, payload.receiver_id, payload.teach_skill_id, payload.learn_skill_id),
        )
        rid = cur.lastrowid
    return get_request_detail(rid, conn)


@app.get("/api/requests/{sid}")
def list_requests(sid: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT id FROM requests WHERE sender_id=? OR receiver_id=? ORDER BY id DESC",
        (sid, sid),
    ).fetchall()
    return {"requests": [get_request_detail(r["id"], conn) for r in rows]}


@app.post("/api/requests/{rid}/accept")
def accept_request(rid: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if row["status"] != "pending":
        raise HTTPException(status_code=409, detail="Request already decided")
    with transaction(conn):
        conn.execute("UPDATE requests SET status='accepted', decided_at=datetime('now') WHERE id=?", (rid,))
    return get_request_detail(rid, conn)


@app.post("/api/requests/{rid}/reject")
def reject_request(rid: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if row["status"] != "pending":
        raise HTTPException(status_code=409, detail="Request already decided")
    with transaction(conn):
        conn.execute("UPDATE requests SET status='rejected', decided_at=datetime('now') WHERE id=?", (rid,))
    return get_request_detail(rid, conn)


@app.post("/api/requests/{rid}/complete")
def complete_request(rid: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if row["status"] != "accepted":
        raise HTTPException(status_code=409, detail="Only an accepted exchange can be completed")
    with transaction(conn):
        conn.execute("UPDATE requests SET status='completed', decided_at=datetime('now') WHERE id=?", (rid,))
    return get_request_detail(rid, conn)


def get_request_detail(rid: int, conn=None) -> dict:
    conn = conn or get_conn()
    row = conn.execute(
        """SELECT r.id, r.sender_id, r.receiver_id, r.status, r.created_at,
                  s1.name AS sender_name, s2.name AS receiver_name,
                  k1.name AS teach_skill, k1.category AS teach_category,
                  k1.level AS teach_level, k2.name AS learn_skill
           FROM requests r
           JOIN students s1 ON s1.id=r.sender_id
           JOIN students s2 ON s2.id=r.receiver_id
           JOIN skills k1 ON k1.id=r.teach_skill_id
           JOIN skills k2 ON k2.id=r.learn_skill_id
           WHERE r.id=?""",
        (rid,),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return dict(row)