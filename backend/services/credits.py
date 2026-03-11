"""Credit system: check and manage per-user spending limits."""

import json
import os

from database import get_db

DEFAULT_CREDIT_LIMIT = 5.0

ADMIN_USER_IDS: set[str] = set()
_raw = os.getenv("ADMIN_USER_IDS", "")
if _raw:
    ADMIN_USER_IDS = {uid.strip() for uid in _raw.split(",") if uid.strip()}


def is_admin(user_id: str) -> bool:
    return user_id in ADMIN_USER_IDS


def get_credit_limit(user_id: str) -> float:
    """Get the credit limit for a user. Returns default if no custom limit set."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT credit_limit FROM user_credits WHERE user_id = %s", (user_id,))
            row = cur.fetchone()
    if row:
        return row[0]
    return DEFAULT_CREDIT_LIMIT


def get_total_spent(user_id: str) -> float:
    """Compute total spent by a user from their forecast history cost_stats."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT cost_stats FROM forecast_history WHERE user_id = %s AND cost_stats != '{}'::jsonb",
                (user_id,),
            )
            rows = cur.fetchall()
    total = 0.0
    for (raw,) in rows:
        if isinstance(raw, str):
            try:
                cs = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                continue
        elif isinstance(raw, dict):
            cs = raw
        else:
            continue
        total += cs.get("total_cost", 0) + cs.get("planner_cost", 0)
    return total


def check_credit(user_id: str) -> tuple[bool, float, float]:
    """Check if user has credit remaining. Returns (allowed, remaining, limit)."""
    limit = get_credit_limit(user_id)
    spent = get_total_spent(user_id)
    remaining = max(0.0, limit - spent)
    return remaining > 0, round(remaining, 4), limit


def set_credit_limit(user_id: str, limit: float) -> None:
    """Set or update a user's credit limit."""
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO user_credits (user_id, credit_limit)
                   VALUES (%s, %s)
                   ON CONFLICT (user_id) DO UPDATE SET credit_limit = %s""",
                (user_id, limit, limit),
            )
