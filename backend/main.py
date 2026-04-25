"""
Fake Review Detection System — Backend
Entry point: runs the FastAPI application.
"""
from api.app import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="0.0.0.0", port=5000, reload=True)
