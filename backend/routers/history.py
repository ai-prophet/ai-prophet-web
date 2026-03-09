"""Forecast history API endpoints."""

import json
import time
import uuid

from fastapi import APIRouter
from pydantic import BaseModel
import psycopg2.extras

from database import get_db

router = APIRouter(prefix="/api/history", tags=["history"])


class SaveForecastRequest(BaseModel):
    user_id: str
    title: str
    submission: dict[str, float]


class ForecastEntry(BaseModel):
    id: str
    title: str
    submission: dict[str, float]
    timestamp: float


@router.post("")
async def save_forecast(req: SaveForecastRequest):
    entry_id = f"forecast_{uuid.uuid4().hex[:12]}"
    now = time.time() * 1000  # ms timestamp to match frontend
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO forecast_history (id, user_id, title, submission, created_at) VALUES (%s, %s, %s, %s, %s)",
                (entry_id, req.user_id, req.title, json.dumps(req.submission), now),
            )
    return {"id": entry_id, "timestamp": now}


@router.get("/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, submission, created_at FROM forecast_history WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            rows = cur.fetchall()
    return [
        ForecastEntry(
            id=row["id"],
            title=row["title"],
            submission=row["submission"] if isinstance(row["submission"], dict) else json.loads(row["submission"]),
            timestamp=row["created_at"],
        )
        for row in rows
    ]


@router.delete("/{entry_id}")
async def delete_forecast(entry_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM forecast_history WHERE id = %s", (entry_id,))
    return {"ok": True}
