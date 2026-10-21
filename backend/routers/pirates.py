from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Response
from psycopg.errors import ForeignKeyViolation

from db import pool
from models import Pirate, PirateIn, PiratePage

router = APIRouter(prefix="/pirates", tags=["pirates"])

PIRATE_SELECT = """
    SELECT p.*, s.name AS ship_name
    FROM pirates p
    JOIN ships s ON s.id = p.ship_id
"""


def fetch_pirate(cur, pirate_id: UUID) -> dict:
    cur.execute(PIRATE_SELECT + " WHERE p.id = %s", (pirate_id,))
    pirate = cur.fetchone()
    if pirate is None:
        raise HTTPException(status_code=404, detail="Pirate not found - walked the plank? 🦈")
    return pirate


@router.get("", response_model=PiratePage)
def list_pirates(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100, alias="pageSize"),
    search: str = "",
    ship_id: UUID | None = Query(None, alias="shipId"),
):
    # Build the WHERE part step by step - values always go in as %s parameters
    conditions = ["p.name ILIKE %s"]
    params: list = [f"%{search}%"]
    if ship_id is not None:
        conditions.append("p.ship_id = %s")
        params.append(ship_id)
    where = " WHERE " + " AND ".join(conditions)

    offset = (page - 1) * page_size

    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) AS total FROM pirates p" + where, params)
        total = cur.fetchone()["total"]

        cur.execute(
            PIRATE_SELECT + where + " ORDER BY p.created_at DESC LIMIT %s OFFSET %s",
            params + [page_size, offset],
        )
        items = cur.fetchall()

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{pirate_id}", response_model=Pirate)
def get_pirate(pirate_id: UUID):
    with pool.connection() as conn, conn.cursor() as cur:
        return fetch_pirate(cur, pirate_id)


@router.post("", response_model=Pirate, status_code=201)
def create_pirate(pirate: PirateIn):
    with pool.connection() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """INSERT INTO pirates (ship_id, name, missing_limbs, parrot_name, rum_per_day, loyalty)
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (pirate.ship_id, pirate.name, pirate.missing_limbs,
                 pirate.parrot_name, pirate.rum_per_day, pirate.loyalty),
            )
        except ForeignKeyViolation:
            raise HTTPException(status_code=400, detail="That ship doesn't exist ⚓")
        new_id = cur.fetchone()["id"]
        return fetch_pirate(cur, new_id)


@router.put("/{pirate_id}", response_model=Pirate)
def update_pirate(pirate_id: UUID, pirate: PirateIn):
    with pool.connection() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """UPDATE pirates
                   SET ship_id = %s, name = %s, missing_limbs = %s,
                       parrot_name = %s, rum_per_day = %s, loyalty = %s
                   WHERE id = %s""",
                (pirate.ship_id, pirate.name, pirate.missing_limbs,
                 pirate.parrot_name, pirate.rum_per_day, pirate.loyalty, pirate_id),
            )
        except ForeignKeyViolation:
            raise HTTPException(status_code=400, detail="That ship doesn't exist ⚓")
        return fetch_pirate(cur, pirate_id)


@router.delete("/{pirate_id}", status_code=204)
def delete_pirate(pirate_id: UUID):
    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM pirates WHERE id = %s", (pirate_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Pirate not found - walked the plank? 🦈")
    return Response(status_code=204)