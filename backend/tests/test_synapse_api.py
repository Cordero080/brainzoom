"""Backend regression tests for Synapse — Cosmic Brain API."""
import os
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://synapse-explorer-1.preview.emergentagent.com",
).rstrip("/")

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- /api/ root ----------
class TestRoot:
    def test_root_message(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body == {"message": "Synapse — Cosmic Brain API is online."}


# ---------- /api/regions ----------
class TestRegions:
    def test_list_regions(self, client):
        r = client.get(f"{API}/regions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8, f"Expected 8 regions, got {len(data)}"
        required_keys = {"id", "name", "latin", "function", "summary", "coords", "color"}
        for region in data:
            missing = required_keys - region.keys()
            assert not missing, f"Region {region.get('id')} missing keys: {missing}"
            assert isinstance(region["coords"], list) and len(region["coords"]) == 3
            assert all(isinstance(c, (int, float)) for c in region["coords"])
            assert isinstance(region["color"], str) and region["color"].startswith("#")

    def test_get_region_by_id(self, client):
        r = client.get(f"{API}/regions/frontal-lobe")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "frontal-lobe"
        assert data["name"] == "Frontal Lobe"
        assert data["latin"] == "Lobus frontalis"
        assert "function" in data and data["function"]
        # frontal-lobe has both danger and fun_fact
        assert data.get("danger")
        assert data.get("fun_fact")

    def test_get_region_unknown_404(self, client):
        r = client.get(f"{API}/regions/does-not-exist")
        assert r.status_code == 404
        body = r.json()
        assert "detail" in body


# ---------- /api/structures ----------
class TestStructures:
    def test_list_structures(self, client):
        r = client.get(f"{API}/structures")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 7, f"Expected 7 structures, got {len(data)}"
        required = {"id", "name", "category", "summary", "detail", "metrics"}
        valid_cats = {"neuron", "synapse", "pathway"}
        for s in data:
            missing = required - s.keys()
            assert not missing, f"Structure {s.get('id')} missing: {missing}"
            assert s["category"] in valid_cats
            assert isinstance(s["metrics"], dict) and s["metrics"]

    def test_structures_category_counts(self, client):
        r = client.get(f"{API}/structures")
        data = r.json()
        from collections import Counter
        counts = Counter(s["category"] for s in data)
        # neuron(3) + synapse(2) + pathway(2) = 7
        assert set(counts.keys()) == {"neuron", "synapse", "pathway"}
        assert sum(counts.values()) == 7


# ---------- /api/status ----------
class TestStatus:
    def test_create_and_list_status(self, client):
        payload = {"client_name": "TEST_qa"}
        r = client.post(f"{API}/status", json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["client_name"] == "TEST_qa"
        assert "id" in created and isinstance(created["id"], str)
        assert "timestamp" in created

        # GET list should include the created id
        r2 = client.get(f"{API}/status")
        assert r2.status_code == 200
        items = r2.json()
        assert isinstance(items, list)
        ids = [i["id"] for i in items]
        assert created["id"] in ids
        # No mongo _id leak
        assert all("_id" not in i for i in items)
