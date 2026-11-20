from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_keyless_preview_extracts_explicit_text_without_a_risk_claim():
    response = client.post(
        "/api/v1/processor/",
        json={
            "fir_text": "On 12 August 2025 at 10:30 PM, a person named Arun Kumar was seen near Whitefield in a white car.",
            "witness_statements": [],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["analysis_mode"] == "synthetic_preview"
    assert "Arun Kumar" in str(data["entities"])
    assert data["scoring"]["overall_confidence"] == 0
    assert "unverified" in data["notice"].lower()


def test_keyless_preview_requires_text():
    response = client.post("/api/v1/processor/", json={"fir_text": ""})
    assert response.status_code == 422
