"""FastAPI application for mini-prophet web interface."""

import os

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None

if load_dotenv is not None:
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.admin import router as admin_router
from routers.forecast import router as forecast_router
from routers.history import router as history_router

app = FastAPI(title="AI Prophet")

# CORS: allow frontend origin. Set CORS_ORIGINS for explicit origins (comma-separated).
# By default we allow localhost + *.vercel.app so Vercel deploys work without config.
_cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000").strip().split(",")
_cors_origins = [o.strip() for o in _cors_origins_raw if o.strip()] or ["http://localhost:3000"]
# Regex: matches *.vercel.app and *.prophetarena.co
_cors_origin_regex = r"https://(.*\.vercel\.app|.*\.prophetarena\.co)"

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(forecast_router)
app.include_router(history_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
