"""Security and authorization test suite."""

import sqlite3
import pytest
from fastapi.testclient import TestClient

from app.auth import create_session_token, verify_session_token
from app.db import SCHEMA, SEED, get_db, seed
from app.main import app
from app.rate_limiter import rate_limiter


@pytest.fixture(scope="function")
def secure_client():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    seed(conn)

    def override_get_db():
        try:
            yield conn
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    conn.close()


class TestSecurityAndAuth:
    """Validate token cryptography, tampering protection, ownership checks, and headers."""

    def test_token_creation_and_verification(self):
        token = create_session_token(student_id=1, expires_in=3600)
        assert token.startswith("v1.")
        payload = verify_session_token(token)
        assert payload["sub"] == 1
        assert payload["iss"] == "skillswap"

    def test_tampered_token_signature_rejected(self):
        token = create_session_token(student_id=1)
        # Tamper with the signature bytes
        parts = token.split(".")
        tampered_token = f"{parts[0]}.{parts[1]}.tamperedSignature123"
        with pytest.raises(Exception) as exc_info:
            verify_session_token(tampered_token)
        assert "Invalid authentication token signature" in str(exc_info.value)

    def test_expired_token_rejected(self):
        # Generate token with negative expiry
        expired_token = create_session_token(student_id=1, expires_in=-10)
        with pytest.raises(Exception) as exc_info:
            verify_session_token(expired_token)
        assert "expired" in str(exc_info.value)

    def test_auth_session_endpoint(self, secure_client: TestClient):
        res = secure_client.post("/api/auth/session", json={"student_id": 1})
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        assert data["token_type"] == "bearer"
        assert data["student"]["name"] == "Riya Sharma"

    def test_proposal_creation_sender_ownership_enforced(self, secure_client: TestClient):
        # Token for Student 1 (Riya), but attempting to send as Student 10 (Aditya)
        token_riya = create_session_token(student_id=1)
        res = secure_client.post(
            "/api/requests",
            json={
                "sender_id": 10,  # Mismatched!
                "receiver_id": 5,
                "teach_skill_id": 21,
                "learn_skill_id": 22,
            },
            headers={"Authorization": f"Bearer {token_riya}"},
        )
        assert res.status_code == 403
        assert "Authenticated session does not match sender_id" in res.json()["detail"]

    def test_accept_request_recipient_ownership_enforced(self, secure_client: TestClient):
        # Create valid proposal from Student 10 to Student 5 (Meera)
        s10 = secure_client.get("/api/students/10").json()
        teach = next(s for s in s10["skills"] if s["direction"] == "teach")
        learn = next(s for s in s10["skills"] if s["direction"] == "learn")

        token_aditya = create_session_token(student_id=10)
        create_res = secure_client.post(
            "/api/requests",
            json={
                "sender_id": 10,
                "receiver_id": 5,
                "teach_skill_id": teach["id"],
                "learn_skill_id": learn["id"],
            },
            headers={"Authorization": f"Bearer {token_aditya}"},
        )
        assert create_res.status_code == 201
        rid = create_res.json()["id"]

        # Student 1 (Riya) tries to accept Student 5's proposal -> Forbidden
        token_riya = create_session_token(student_id=1)
        unauth_accept = secure_client.post(
            f"/api/requests/{rid}/accept",
            headers={"Authorization": f"Bearer {token_riya}"},
        )
        assert unauth_accept.status_code == 403
        assert "Only the proposal recipient" in unauth_accept.json()["detail"]

        # Student 5 (Meera) accepts -> Success!
        token_meera = create_session_token(student_id=5)
        auth_accept = secure_client.post(
            f"/api/requests/{rid}/accept",
            headers={"Authorization": f"Bearer {token_meera}"},
        )
        assert auth_accept.status_code == 200
        assert auth_accept.json()["status"] == "accepted"

    def test_security_headers_present(self, secure_client: TestClient):
        res = secure_client.get("/api/students")
        assert res.headers["x-content-type-options"] == "nosniff"
        assert res.headers["x-frame-options"] == "DENY"
        assert res.headers["x-xss-protection"] == "1; mode=block"
        assert res.headers["referrer-policy"] == "strict-origin-when-cross-origin"
