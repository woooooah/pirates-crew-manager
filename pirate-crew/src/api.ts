import type { Pirate, PirateInput, Ship, ShipInput, ShipOption } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type Page<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(API_URL + path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            if (typeof body.detail === "string") message = body.detail;
            else if (Array.isArray(body.detail))
                message = body.detail
                    .map((d: { msg: string }) => d.msg)
                    .join(", ");
        } catch {
            /* response wasn't JSON - keep the generic message */
        }
        throw new Error(message);
    }

    if (res.status === 204) return undefined as T; // DELETE returns no body
    return res.json();
}

function toQuery(params: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") q.set(key, String(value));
    }
    return q.toString();
}

type ListParams = { page: number; pageSize?: number; search?: string };

export const api = {
    // ships
    getShips: (p: ListParams) => request<Page<Ship>>(`/ships?${toQuery(p)}`),
    getShipOptions: () => request<ShipOption[]>("/ships/options"),
    createShip: (data: ShipInput) =>
        request<Ship>("/ships", { method: "POST", body: JSON.stringify(data) }),
    updateShip: (id: string, data: ShipInput) =>
        request<Ship>(`/ships/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteShip: (id: string) =>
        request<void>(`/ships/${id}`, { method: "DELETE" }),

    // pirates
    getPirates: (p: ListParams & { shipId?: string }) =>
        request<Page<Pirate>>(`/pirates?${toQuery(p)}`),
    createPirate: (data: PirateInput) =>
        request<Pirate>("/pirates", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updatePirate: (id: string, data: PirateInput) =>
        request<Pirate>(`/pirates/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deletePirate: (id: string) =>
        request<void>(`/pirates/${id}`, { method: "DELETE" }),
};
