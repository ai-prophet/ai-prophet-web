"""Forecast history API endpoints."""

import json
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException
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
    cost_stats: dict | None = None


class ForecastEntry(BaseModel):
    id: str
    title: str
    submission: dict[str, float]
    outcomes: list[str] = Field(default_factory=list)
    cost_stats: dict = Field(default_factory=dict)
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
            if req.cost_stats:
                cur.execute(
                    "UPDATE forecast_history SET submission = %s, cost_stats = %s WHERE id = %s AND user_id = %s",
                    (json.dumps(req.submission), json.dumps(req.cost_stats), entry_id, req.user_id),
                )
            else:
                cur.execute(
                    "UPDATE forecast_history SET submission = %s WHERE id = %s AND user_id = %s",
                    (json.dumps(req.submission), entry_id, req.user_id),
                )
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Forecast not found")
    return {"ok": True}


@router.get("/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, submission, outcomes, cost_stats, created_at FROM forecast_history WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
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
        raw_cost = row.get("cost_stats")
        if isinstance(raw_cost, dict):
            cost_stats = raw_cost
        elif isinstance(raw_cost, str):
            try:
                cost_stats = json.loads(raw_cost)
            except (json.JSONDecodeError, TypeError):
                cost_stats = {}
        else:
            cost_stats = {}
        results.append(ForecastEntry(
            id=row["id"],
            title=row["title"],
            submission=sub,
            outcomes=outcomes,
            cost_stats=cost_stats,
            timestamp=row["created_at"],
        ))
    return results


@router.get("/{user_id}/usage")
async def get_usage(user_id: str):
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, title, cost_stats, created_at FROM forecast_history WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,),
            )
            rows = cur.fetchall()
    totals = {"total_cost": 0.0, "model_cost": 0.0, "search_cost": 0.0, "planner_cost": 0.0, "n_api_calls": 0, "n_searches": 0, "total_runs": 0}
    runs = []
    for row in rows:
        raw = row.get("cost_stats")
        if isinstance(raw, str):
            try:
                cs = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                cs = {}
        elif isinstance(raw, dict):
            cs = raw
        else:
            cs = {}
        if not cs:
            continue
        totals["total_runs"] += 1
        totals["total_cost"] += cs.get("total_cost", 0) + cs.get("planner_cost", 0)
        totals["model_cost"] += cs.get("model_cost", 0)
        totals["search_cost"] += cs.get("search_cost", 0)
        totals["planner_cost"] += cs.get("planner_cost", 0)
        totals["n_api_calls"] += cs.get("n_api_calls", 0)
        totals["n_searches"] += cs.get("n_searches", 0)
        runs.append({
            "id": row["id"],
            "title": row["title"],
            "cost_stats": cs,
            "created_at": row["created_at"],
        })
    # Round totals
    for k in ("total_cost", "model_cost", "search_cost", "planner_cost"):
        totals[k] = round(totals[k], 6)
    return {"totals": totals, "runs": runs}


@router.get("/{user_id}/credit")
async def get_credit(user_id: str):
    """Return credit limit, total spent, and remaining for a user."""
    from services.credits import get_credit_limit, get_total_spent
    limit = get_credit_limit(user_id)
    spent = get_total_spent(user_id)
    return {
        "credit_limit": limit,
        "total_spent": round(spent, 4),
        "remaining": round(max(0, limit - spent), 4),
    }


RUNS_DIR = Path(__file__).resolve().parent.parent / "runs"


@router.post("/{entry_id}/trace/{run_id}")
async def save_trace(entry_id: str, run_id: str, user_id: str = ""):
    """Read the reasoning trace from the runs directory and save it to the DB."""
    if not user_id:
        raise HTTPException(401, "user_id is required")
    # Validate run_id to prevent path traversal
    import re
    if not re.match(r'^[\w\-]+$', run_id):
        raise HTTPException(400, "Invalid run_id")
    run_dir = (RUNS_DIR / run_id).resolve()
    if not str(run_dir).startswith(str(RUNS_DIR.resolve())):
        raise HTTPException(400, "Invalid run_id")
    if not run_dir.is_dir():
        raise HTTPException(404, f"Run directory '{run_id}' not found")
    trace = {}
    for filename in ("info.json", "trajectory.json", "sources.json"):
        fpath = run_dir / filename
        if fpath.exists():
            try:
                trace[filename.replace(".json", "")] = json.loads(fpath.read_text())
            except (json.JSONDecodeError, OSError):
                pass
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE forecast_history SET reasoning_trace = %s WHERE id = %s AND user_id = %s",
                (json.dumps(trace), entry_id, user_id),
            )
            if cur.rowcount == 0:
                raise HTTPException(404, "Forecast entry not found or not owned by user")
    return {"ok": True}


@router.get("/{entry_id}/trace")
async def get_trace(entry_id: str, user_id: str = ""):
    """Retrieve the stored reasoning trace for a forecast entry."""
    if not user_id:
        raise HTTPException(401, "user_id is required")
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT reasoning_trace FROM forecast_history WHERE id = %s AND user_id = %s",
                (entry_id, user_id),
            )
            row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Forecast entry not found or not owned by user")
    trace = row.get("reasoning_trace")
    if not trace:
        return {"trace": None}
    if isinstance(trace, str):
        trace = json.loads(trace)
    return {"trace": trace}


@router.delete("/{entry_id}")
async def delete_forecast(entry_id: str):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM forecast_history WHERE id = %s", (entry_id,))
    return {"ok": True}
