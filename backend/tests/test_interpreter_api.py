# Backend API tests for Judicial Interpreter platform

import pytest
import requests
import os
from pathlib import Path

# Load REACT_APP_BACKEND_URL from frontend/.env if not present in environment
def get_base_url():
    url = os.environ.get('REACT_APP_BACKEND_URL')
    if not url:
        # Try reading from frontend/.env
        try:
            env_path = Path(__file__).resolve().parents[2] / 'frontend' / '.env'
            if env_path.exists():
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.startswith('REACT_APP_BACKEND_URL='):
                            url = line.strip().split('=', 1)[1]
                            break
        except Exception:
            pass
    if not url:
        url = 'https://juge-interp-idf.preview.emergentagent.com'
    return url.rstrip('/')

BASE_URL = get_base_url()

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

def test_root_endpoint(api_client):
    """Verify that root endpoint returns Hello World message"""
    response = api_client.get(f"{BASE_URL}/api/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Hello World"

def test_status_check_creation_and_persistence(api_client):
    """Verify that status checks can be created and are persisted in database"""
    # 1. Create a status check
    client_name = "TEST_Client_E2E"
    payload = {"client_name": client_name}
    
    post_response = api_client.post(f"{BASE_URL}/api/status", json=payload)
    assert post_response.status_code == 200
    
    post_data = post_response.json()
    assert "id" in post_data
    assert post_data["client_name"] == client_name
    assert "timestamp" in post_data
    assert isinstance(post_data["id"], str)
    
    # 2. Verify persistence via GET
    get_response = api_client.get(f"{BASE_URL}/api/status")
    assert get_response.status_code == 200
    
    get_data = get_response.json()
    assert isinstance(get_data, list)
    
    # Ensure our newly created item is in the list
    found = False
    for item in get_data:
        if item["id"] == post_data["id"]:
            assert item["client_name"] == client_name
            found = True
            break
            
    assert found, f"Created status check with ID {post_data['id']} was not found in GET status checks list"
