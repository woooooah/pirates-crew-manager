from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Response
from psycopg.errors import UniqueViolation
from models import Ship, ShipIn, ShipOption, ShipPage
from db import pool
from models import Ship, ShipIn, ShipPage

router = APIRouter(prefix="/ships", tags=["ships"])

SHIP_SELECT = """
    SELECT s.*,
           (SELECT count(*) FROM pirates p WHERE p.ship_id = s.id) AS crew_count
    FROM ships s
"""


def fetch_ship(cur, ship_id: UUID) -> dict:
    cur.execute(SHIP_SELECT + " WHERE s.id = %s", (ship_id,))
    ship = cur.fetchone()
    if ship is None:
        raise HTTPException(status_code=404, detail="Ship not found - probably sunk 🌊")
    return ship


@router.get("", response_model=ShipPage)
def list_ships(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100, alias="pageSize"),
    search: str = "",
):
    pattern = f"%{search}%"
    offset = (page - 1) * page_size

    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*) AS total FROM ships WHERE name ILIKE %s", (pattern,))
        total = cur.fetchone()["total"]

        cur.execute(
            SHIP_SELECT + " WHERE s.name ILIKE %s ORDER BY s.created_at DESC LIMIT %s OFFSET %s",
            (pattern, page_size, offset),
        )
        items = cur.fetchall()

    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/options", response_model=list[ShipOption])
def list_ship_options():
    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute("SELECT id, name FROM ships ORDER BY name")
        return cur.fetchall()


@router.get("/{ship_id}", response_model=Ship)
def get_ship(ship_id: UUID):
    with pool.connection() as conn, conn.cursor() as cur:
        return fetch_ship(cur, ship_id)


@router.post("", response_model=Ship, status_code=201)
def create_ship(ship: ShipIn):
    with pool.connection() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """INSERT INTO ships (name, flag, cannons, sinking_risk)
                   VALUES (%s, %s, %s, %s) RETURNING id""",
                (ship.name, ship.flag, ship.cannons, ship.sinking_risk),
            )
        except UniqueViolation:
            raise HTTPException(status_code=409, detail="A ship with this name already sails these seas")
        new_id = cur.fetchone()["id"]
        return fetch_ship(cur, new_id)


@router.put("/{ship_id}", response_model=Ship)
def update_ship(ship_id: UUID, ship: ShipIn):
    with pool.connection() as conn, conn.cursor() as cur:
        try:
            cur.execute(
                """UPDATE ships SET name = %s, flag = %s, cannons = %s, sinking_risk = %s
                   WHERE id = %s""",
                (ship.name, ship.flag, ship.cannons, ship.sinking_risk, ship_id),
            )
        except UniqueViolation:
            raise HTTPException(status_code=409, detail="A ship with this name already sails these seas")
        return fetch_ship(cur, ship_id)


@router.delete("/{ship_id}", status_code=204)
def delete_ship(ship_id: UUID):
    with pool.connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM ships WHERE id = %s", (ship_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ship not found - probably sunk 🌊")
    return Response(status_code=204)