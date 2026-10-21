import { useEffect, useState } from "react";
import { api, type Page } from "../api";
import type { Ship, ShipInput } from "../types";
import Pagination from "./Pagination";
import ShipForm from "./ShipForm";

const PAGE_SIZE = 30;

type ShipsPageProps = {
    onViewCrew: (ship: Ship) => void;
};

function ShipsPage({ onViewCrew }: ShipsPageProps) {
    const [data, setData] = useState<Page<Ship> | null>(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingShipId, setEditingShipId] = useState<string | null>(null);

    // Wait 300 ms after the user stops typing before searching
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Load ships whenever page, search or reloadKey changes
    useEffect(() => {
        let ignore = false;
        setLoading(true);

        api.getShips({ page, pageSize: PAGE_SIZE, search })
            .then((result) => {
                if (ignore) return;
                if (result.items.length === 0 && page > 1)
                    setPage(page - 1); // page became empty
                else setData(result);
                setError(null);
            })
            .catch((e: Error) => !ignore && setError(e.message))
            .finally(() => !ignore && setLoading(false));

        return () => {
            ignore = true;
        };
    }, [page, search, reloadKey]);

    const reload = () => setReloadKey((k) => k + 1);

    async function addShip(input: ShipInput) {
        try {
            await api.createShip(input);
            setShowForm(false);
            setPage(1);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    async function updateShip(id: string, input: ShipInput) {
        try {
            await api.updateShip(id, input);
            setEditingShipId(null);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    async function deleteShip(ship: Ship) {
        if (
            !confirm(
                `Really sink ${ship.name}? Its ${ship.crewCount} pirates go down with it!`,
            )
        )
            return;
        try {
            await api.deleteShip(ship.id);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    return (
        <>
            {showForm ? (
                <ShipForm
                    onSave={addShip}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <div className="text-center mb-4">
                    <button
                        className="addButton"
                        onClick={() => setShowForm(true)}>
                        + Add ship
                    </button>
                </div>
            )}

            <div className="searchBox mb-4">
                <input
                    className="form-control"
                    placeholder="🔍 Search ships..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {error && <p className="text-center text-danger"> {error}</p>}
            {loading && !data && (
                <p className="statusText">Raising the sails... </p>
            )}

            {data && (
                <>
                    <div className={`row px-5 ${loading ? "opacity-50" : ""}`}>
                        {data.items.map((ship) => (
                            <div
                                key={ship.id}
                                className="col-12 col-sm-6 col-lg-4 mb-4">
                                {ship.id === editingShipId ? (
                                    <ShipForm
                                        initialShip={ship}
                                        onSave={(input) =>
                                            updateShip(ship.id, input)
                                        }
                                        onCancel={() => setEditingShipId(null)}
                                    />
                                ) : (
                                    <div className="shipList h-100">
                                        <h2>{ship.name}</h2>
                                        <p className="shipStat">{ship.flag}</p>
                                        <p className="shipStat">
                                            {ship.cannons} cannons on board
                                        </p>
                                        <p className="shipStat">
                                            {ship.sinkingRisk}% sinking risk
                                        </p>
                                        <p className="shipStat">
                                            {ship.crewCount}{" "}
                                            {ship.crewCount === 1
                                                ? "pirate"
                                                : "pirates"}{" "}
                                            aboard
                                        </p>
                                        <button
                                            className="me-2"
                                            onClick={() => onViewCrew(ship)}>
                                            View crew
                                        </button>
                                        <button
                                            className="me-2"
                                            onClick={() =>
                                                setEditingShipId(ship.id)
                                            }>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteShip(ship)}>
                                            Sink ship
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {data.items.length === 0 ? (
                        <p className="statusText">
                            No ships found. The sea is quiet...
                        </p>
                    ) : (
                        <Pagination
                            page={page}
                            total={data.total}
                            pageSize={PAGE_SIZE}
                            onChange={setPage}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default ShipsPage;
