# tests/test_main.py
#
# Run with:  pytest tests/test_main.py -v
#
# These tests use FastAPI's TestClient + an in-memory SQLite database so
# they never touch the real evaluator.db and never call the Gemini API.

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ── Bootstrap: point the app at an in-memory DB before importing main ──────
import os
os.environ.setdefault("GEMINI_API_KEY", "")   # ensure mock path is taken

import models
import database
from main import app
from database import get_db

# In-memory SQLite — isolated per test session
TEST_DATABASE_URL = "sqlite:///./test_evaluator.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the test DB
models.Base.metadata.create_all(bind=engine)


def override_get_db():
    """Replace the real DB session with the test session."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

SAMPLE_IDEA = "An AI tool that converts meeting notes into action items automatically"

def _create_evaluation(idea: str = SAMPLE_IDEA) -> dict:
    """POST /evaluate and return the parsed JSON body."""
    response = client.post("/evaluate", json={"idea": idea})
    assert response.status_code == 200, response.text
    return response.json()


# ── Tests ──────────────────────────────────────────────────────────────────

class TestEvaluateEndpoint:
    """POST /evaluate"""

    def test_evaluate_returns_200(self):
        response = client.post("/evaluate", json={"idea": SAMPLE_IDEA})
        assert response.status_code == 200

    def test_evaluate_response_has_required_fields(self):
        data = _create_evaluation()
        required_fields = [
            "id",
            "idea",
            "executive_summary",
            "market_opportunity",
            "competitor_analysis",
            "swot_analysis",
            "revenue_model",
            "launch_plan",
            "investor_pitch",
            "created_at",
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"

    def test_evaluate_echoes_idea(self):
        data = _create_evaluation()
        assert data["idea"] == SAMPLE_IDEA

    def test_evaluate_fields_are_non_empty_strings(self):
        data = _create_evaluation()
        text_fields = [
            "executive_summary",
            "market_opportunity",
            "competitor_analysis",
            "swot_analysis",
            "revenue_model",
            "launch_plan",
            "investor_pitch",
        ]
        for field in text_fields:
            assert isinstance(data[field], str), f"{field} should be a string"
            assert len(data[field]) > 0, f"{field} should not be empty"

    def test_evaluate_assigns_integer_id(self):
        data = _create_evaluation()
        assert isinstance(data["id"], int)
        assert data["id"] > 0

    def test_evaluate_missing_idea_returns_422(self):
        """Pydantic validation should reject a missing 'idea' field."""
        response = client.post("/evaluate", json={})
        assert response.status_code == 422

    def test_evaluate_empty_idea_still_processes(self):
        """Empty string idea is technically valid at the HTTP level (business
        logic validation is optional); we just check the server doesn't 500."""
        response = client.post("/evaluate", json={"idea": ""})
        assert response.status_code in (200, 422)


class TestHistoryEndpoint:
    """GET /history"""

    def test_history_returns_200(self):
        response = client.get("/history")
        assert response.status_code == 200

    def test_history_returns_list(self):
        response = client.get("/history")
        assert isinstance(response.json(), list)

    def test_history_contains_created_evaluation(self):
        created = _create_evaluation("A blockchain-based loyalty rewards platform")
        history = client.get("/history").json()
        ids = [item["id"] for item in history]
        assert created["id"] in ids

    def test_history_skip_limit_params(self):
        """skip and limit query params should not cause a 500."""
        response = client.get("/history?skip=0&limit=5")
        assert response.status_code == 200
        assert len(response.json()) <= 5


class TestGetByIdEndpoint:
    """GET /history/{id}"""

    def test_get_by_valid_id_returns_200(self):
        created = _create_evaluation()
        response = client.get(f"/history/{created['id']}")
        assert response.status_code == 200

    def test_get_by_valid_id_returns_correct_record(self):
        created = _create_evaluation()
        fetched = client.get(f"/history/{created['id']}").json()
        assert fetched["id"] == created["id"]
        assert fetched["idea"] == created["idea"]

    def test_get_by_nonexistent_id_returns_404(self):
        response = client.get("/history/999999")
        assert response.status_code == 404

    def test_get_by_nonexistent_id_has_detail_key(self):
        response = client.get("/history/999999")
        assert "detail" in response.json()


class TestSearchEndpoint:
    """GET /search?q="""

    def test_search_returns_200(self):
        response = client.get("/search?q=AI")
        assert response.status_code == 200

    def test_search_returns_list(self):
        response = client.get("/search?q=AI")
        assert isinstance(response.json(), list)

    def test_search_finds_matching_idea(self):
        unique_idea = "Hyperlocal dog-walking marketplace for rural areas"
        created = _create_evaluation(unique_idea)
        results = client.get("/search?q=dog-walking").json()
        ids = [r["id"] for r in results]
        assert created["id"] in ids

    def test_search_no_match_returns_empty_list(self):
        results = client.get("/search?q=xyzzy_no_match_12345").json()
        assert results == []


class TestDeleteEndpoint:
    """DELETE /history/{id}"""

    def test_delete_existing_record_returns_200(self):
        created = _create_evaluation()
        response = client.delete(f"/history/{created['id']}")
        assert response.status_code == 200

    def test_delete_removes_record_from_history(self):
        created = _create_evaluation()
        client.delete(f"/history/{created['id']}")
        # Should 404 after deletion
        response = client.get(f"/history/{created['id']}")
        assert response.status_code == 404

    def test_delete_response_has_message(self):
        created = _create_evaluation()
        data = client.delete(f"/history/{created['id']}").json()
        assert "message" in data


# ── Teardown ───────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """Remove the test database file after the full test session."""
    yield
    import os
    if os.path.exists("./test_evaluator.db"):
        os.remove("./test_evaluator.db")