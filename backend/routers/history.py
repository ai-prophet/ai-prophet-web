"""Forecast history API endpoints."""

import json
import time
import uuid

from fastapi import APIRouter
from pydantic import BaseModel, Field
import psycopg2.extras

from database import get_db

router = APIRouter(prefix="/api/history", tags=["history"])


class SaveForecastRequest(BaseModel):
    user_id: str
    title: str
    submission: dict[str, float] = Field(default_factory=dict)
    outcomes: list[str] = Field(default_factory=list)


class UpdateForecastRequest(BaseModel):
    user_id: str
    submission: dict[str, float]


class ForecastEntry(BaseModel):
    id: str
    title: str
    submission: dict[str, float]
    outcomes: list[str] = Field(default_factory=list)
    timestamp: float


@router.post("")
async def save_forecast(req: SaveForecastRequest):
    entry_id = f"forecast_{uuid.uuid4().hex[:12]}"
    now = time.time() * 1000  # ms timestamp to match frontend
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO forecast_history (id, user_id, title, submission, outcomes, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                (entry_id, req.user_id, req.title, json.dumps(req.submission), json.dumps(req.outcomes), now),
            )
    return {"id": entry_id, "timestamp": now}


@router.put("/{entry_id}")
async def update_forecast(entry_id: str, req: UpdateForecastRequest):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE forecast_history SET submission = %s WHERE id = %s AND user_id = %s",
                (json.dumps(req.submission), entry_id, req.user_id),
            )
            if cur.rowcount == 0:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Forecast not found")
    return {"ok": True}


@router.get("/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, submission, outcomes, created_at FROM forecast_history WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
                (user_id, limit),
            )
            rows = cur.fetchall()
    results = []
    for row in rows:
        sub = row["submission"]
        if not isinstance(sub, dict):
            sub = json.loads(sub) if sub else {}
        raw_outcomes = row.get("outcomes")
        if isinstance(raw_outcomes, list):
            outcomes = raw_outcomes
        elif isinstance(raw_outcomes, str):
            try:
                outcomes = json.loads(raw_outcomes)
            except (json.JSONDecodeError, TypeError):
                outcomes = []
        else:
            outcomes = []
        results.append(ForecastEntry(
            id=row["id"],
            title=row["title"],
            submission=sub,
            outcomes=outcomes,
            timestamp=row["created_at"],
        ))
    return results


@router.delete("/{entry_id}")
async def delete_forecast(entry_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM forecast_history WHERE id = %s", (entry_id,))
    return {"ok": True}
