"""Admin API endpoints for managing user credits."""

import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import psycopg2.extras

from database import get_db
from services.credits import is_admin, get_total_spent, set_credit_limit, DEFAULT_CREDIT_LIMIT

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(user_id: str) -> None:
    if not user_id or not is_admin(user_id):
        raise HTTPException(403, "Admin access required")


class SetCreditRequest(BaseModel):
    admin_user_id: str
    target_user_id: str
    credit_limit: float


@router.get("/users")
async def list_users(admin_user_id: str):
    """List all users with their credit limits and total spent."""
    _require_admin(admin_user_id)
    with get_db() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # Get all unique user_ids from forecast_history
            cur.execute("""
                SELECT
                    fh.user_id,
                    COUNT(*) as total_forecasts,
                    MIN(fh.created_at) as first_seen,
                    MAX(fh.created_at) as last_seen,
                    uc.credit_limit
                FROM forecast_history fh
                LEFT JOIN user_credits uc ON fh.user_id = uc.user_id
                GROUP BY fh.user_id, uc.credit_limit
                ORDER BY MAX(fh.created_at) DESC
            """)
            rows = cur.fetchall()
    users = []
    for row in rows:
        user_id = row["user_id"]
        spent = get_total_spent(user_id)
        limit = row["credit_limit"] if row["credit_limit"] is not None else DEFAULT_CREDIT_LIMIT
        users.append({
            "user_id": user_id,
            "credit_limit": limit,
            "total_spent": round(spent, 4),
            "remaining": round(max(0, limit - spent), 4),
            "total_forecasts": row["total_forecasts"],
            "first_seen": row["first_seen"],
            "last_seen": row["last_seen"],
            "is_admin": is_admin(user_id),
        })
    return {"users": users}


@router.post("/credits")
async def update_credit(req: SetCreditRequest):
    """Set or update a user's credit limit."""
    _require_admin(req.admin_user_id)
    if req.credit_limit < 0:
        raise HTTPException(400, "Credit limit cannot be negative")
    set_credit_limit(req.target_user_id, req.credit_limit)
    spent = get_total_spent(req.target_user_id)
    return {
        "ok": True,
        "user_id": req.target_user_id,
        "credit_limit": req.credit_limit,
        "total_spent": round(spent, 4),
        "remaining": round(max(0, req.credit_limit - spent), 4),
    }


@router.get("/check")
async def check_admin(user_id: str):
    """Check if a user is an admin."""
    return {"is_admin": is_admin(user_id)}
