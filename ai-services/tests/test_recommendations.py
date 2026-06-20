import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_cctv_recommendations():
    response = client.get("/recommendations/cctv?area=Whitefield&crime_type=Theft")
    assert response.status_code == 200
    assert "recommended_cameras" in response.json()

def test_investigation_recommendations():
    response = client.get("/recommendations/investigation")
    assert response.status_code == 200
    assert "recommendations" in response.json()

def test_patrol_recommendations():
    response = client.get("/recommendations/patrol")
    assert response.status_code == 200
    assert "recommendations" in response.json()
