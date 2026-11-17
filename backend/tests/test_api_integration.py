"""API integration tests for students, matching, and exchange lifecycle."""

import sqlite3
import pytest
from fastapi.testclient import TestClient

from app.db import SCHEMA, SEED, get_db, seed
from app.main import app


@pytest.fixture(scope="function")
def test_client():
    """Create an isolated in-memory SQLite database for test execution."""
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    seed(conn)

    def override_get_db():
        try:
            yield conn
        finally:
            pass  # Keep in-memory db open across test calls

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    conn.close()


class TestApiIntegration:
    """Validate REST endpoints, schema responses, and full exchange lifecycle."""

    def test_health_check(self, test_client: TestClient):
        res = test_client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["database"]["connected"] is True
        assert data["database"]["student_count"] >= 18
        assert "x-process-time" in res.headers
        assert res.headers.get("x-frame-options") == "DENY"

    def test_list_students(self, test_client: TestClient):
        res = test_client.get("/api/students")
        assert res.status_code == 200
        students = res.json()
        assert len(students) >= 18
        s1 = next(s for s in students if s["id"] == 1)
        assert s1["name"] == "Riya Sharma"
        assert s1["teach_count"] >= 1
        assert s1["learn_count"] >= 1

    def test_get_student_detail(self, test_client: TestClient):
        res = test_client.get("/api/students/1")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == 1
        assert "skills" in data
        assert len(data["skills"]) > 0

    def test_get_nonexistent_student_returns_404(self, test_client: TestClient):
        res = test_client.get("/api/students/999999")
        assert res.status_code == 404
        data = res.json()
        assert "detail" in data
        assert "error" in data
        assert data["error"]["code"] == 404

    def test_create_student_success(self, test_client: TestClient):
        payload = {
            "name": "Integration Test Student",
            "college": "Test University",
            "bio": "Testing API creation",
            "skills": [
                {"name": "Rust Programming", "category": "Engineering", "direction": "teach", "level": "expert"},
                {"name": "UI Design", "category": "Design", "direction": "learn", "level": "beginner"},
            ],
        }
        res = test_client.post("/api/students", json=payload)
        assert res.status_code == 201
        created = res.json()
        assert created["name"] == "Integration Test Student"
        assert len(created["skills"]) == 2

    def test_create_student_validation_failure(self, test_client: TestClient):
        res = test_client.post("/api/students", json={"name": "", "college": "Test"})
        assert res.status_code == 422
        data = res.json()
        assert data["error"]["code"] == 422

    def test_exchange_request_lifecycle(self, test_client: TestClient):
        # 1. Create a request between Student 10 (Aditya) and Student 5 (Meera)
        # Aditya teaches Data Science (skill_id 21 in seed) and wants UI Design (skill_id 22 in seed)
        s10 = test_client.get("/api/students/10").json()
        teach_skill = next(s for s in s10["skills"] if s["direction"] == "teach")
        learn_skill = next(s for s in s10["skills"] if s["direction"] == "learn")

        req_payload = {
            "sender_id": 10,
            "receiver_id": 5,
            "teach_skill_id": teach_skill["id"],
            "learn_skill_id": learn_skill["id"],
        }

        # Send request
        res = test_client.post("/api/requests", json=req_payload)
        assert res.status_code == 201
        req_data = res.json()
        req_id = req_data["id"]
        assert req_data["status"] == "pending"

        # Duplicate pending request returns 409
        dup_res = test_client.post("/api/requests", json=req_payload)
        assert dup_res.status_code == 409

        # Premature completion returns 409
        premature_res = test_client.post(f"/api/requests/{req_id}/complete")
        assert premature_res.status_code == 409

        # Accept request
        accept_res = test_client.post(f"/api/requests/{req_id}/accept")
        assert accept_res.status_code == 200
        assert accept_res.json()["status"] == "accepted"

        # Re-accepting returns 409
        reaccept_res = test_client.post(f"/api/requests/{req_id}/accept")
        assert reaccept_res.status_code == 409

        # Complete request
        complete_res = test_client.post(f"/api/requests/{req_id}/complete")
        assert complete_res.status_code == 200
        assert complete_res.json()["status"] == "completed"

    def test_request_rejection_lifecycle(self, test_client: TestClient):
        s10 = test_client.get("/api/students/10").json()
        teach_skill = next(s for s in s10["skills"] if s["direction"] == "teach")
        learn_skill = next(s for s in s10["skills"] if s["direction"] == "learn")

        req_payload = {
            "sender_id": 10,
            "receiver_id": 2,
            "teach_skill_id": teach_skill["id"],
            "learn_skill_id": learn_skill["id"],
        }
        create_res = test_client.post("/api/requests", json=req_payload)
        assert create_res.status_code == 201
        req_id = create_res.json()["id"]

        # Reject
        rej_res = test_client.post(f"/api/requests/{req_id}/reject")
        assert rej_res.status_code == 200
        assert rej_res.json()["status"] == "rejected"
