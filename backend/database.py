"""PostgreSQL database for forecast history (Supabase)."""

import os
from contextlib import contextmanager

import psycopg2
import psycopg2.extras


DATABASE_URL = os.getenv("DATABASE_URL", "")


def _get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


@contextmanager
def get_db():
    conn = _get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    if not DATABASE_URL:
        import logging
        logging.getLogger("ai_prophet.db").warning("DATABASE_URL not set — skipping DB init")
        return
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS forecast_history (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        title TEXT NOT NULL,
                        submission JSONB NOT NULL,
                        created_at DOUBLE PRECISION NOT NULL
                    )
                """)
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS idx_forecast_user
                    ON forecast_history(user_id, created_at DESC)
                """)
                # Add outcomes column if not present (migration)
                cur.execute("""
                    ALTER TABLE forecast_history
                    ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]'
                """)
                # Add cost_stats column if not present (migration)
                cur.execute("""
                    ALTER TABLE forecast_history
                    ADD COLUMN IF NOT EXISTS cost_stats JSONB DEFAULT '{}'
                """)
                # Add reasoning_trace column if not present (migration)
                cur.execute("""
                    ALTER TABLE forecast_history
                    ADD COLUMN IF NOT EXISTS reasoning_trace JSONB DEFAULT NULL
                """)
                # Backfill model_name/search_backend into existing cost_stats
                cur.execute("""
                    UPDATE forecast_history
                    SET cost_stats = cost_stats
                        || '{"model_name": "anthropic/claude-sonnet-4-6", "search_backend": "perplexity"}'::jsonb
                    WHERE cost_stats != '{}'::jsonb
                      AND cost_stats->>'model_name' IS NULL
                """)
    except Exception as exc:
        import logging
        logging.getLogger("ai_prophet.db").warning("DB init failed: %s", exc)


init_db()
