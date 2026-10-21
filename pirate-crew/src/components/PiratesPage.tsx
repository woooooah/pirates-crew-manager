import { useEffect, useState } from "react";
import { api, type Page } from "../api";
import type { Pirate, PirateInput, ShipOption } from "../types";
import Pagination from "./Pagination";
import PirateForm from "./PirateForm";

const PAGE_SIZE = 30;

type PiratesPageProps = {
    shipId?: string; // if set: only this ship's crew
};

function PiratesPage({ shipId }: PiratesPageProps) {
    const [data, setData] = useState<Page<Pirate> | null>(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [shipOptions, setShipOptions] = useState<ShipOption[]>([]);

    // Ship list for the dropdown - load once
    useEffect(() => {
        api.getShipOptions()
            .then(setShipOptions)
            .catch((e: Error) => setError(e.message));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let ignore = false;
        setLoading(true);

        api.getPirates({ page, pageSize: PAGE_SIZE, search, shipId })
            .then((result) => {
                if (ignore) return;
                if (result.items.length === 0 && page > 1) setPage(page - 1);
                else setData(result);
                setError(null);
            })
            .catch((e: Error) => !ignore && setError(e.message))
            .finally(() => !ignore && setLoading(false));

        return () => {
            ignore = true;
        };
    }, [page, search, shipId, reloadKey]);

    const reload = () => setReloadKey((k) => k + 1);

    async function addPirate(input: PirateInput) {
        try {
            await api.createPirate(input);
            setShowForm(false);
            setPage(1);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    async function updatePirate(id: string, input: PirateInput) {
        try {
            await api.updatePirate(id, input);
            setEditingId(null);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    async function deletePirate(pirate: Pirate) {
        if (!confirm(`Make ${pirate.name} walk the plank?`)) return;
        try {
            await api.deletePirate(pirate.id);
            reload();
        } catch (e) {
            alert((e as Error).message);
        }
    }

    return (
        <>
            {showForm ? (
                shipOptions.length > 0 ? (
                    <PirateForm
                        ships={shipOptions}
                        defaultShipId={shipId}
                        onSave={addPirate}
                        onCancel={() => setShowForm(false)}
                    />
                ) : (
                    <p className="statusText">Loading ships... ⚓</p>
                )
            ) : (
                <div className="text-center mb-4">
                    <button
                        className="addButton"
                        onClick={() => setShowForm(true)}>
                        + Recruit pirate
                    </button>
                </div>
            )}

            <div className="searchBox mb-4">
                <input
                    className="form-control"
                    placeholder="🔍 Search pirates..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {error && <p className="text-center text-danger">⚠️ {error}</p>}
            {loading && !data && (
                <p className="statusText">Gathering the crew... 🦜</p>
            )}

            {data && (
                <>
                    <div className={`row px-5 ${loading ? "opacity-50" : ""}`}>
                        {data.items.map((pirate) => (
                            <div
                                key={pirate.id}
                                className="col-12 col-sm-6 col-lg-4 mb-4">
                                {pirate.id === editingId ? (
                                    <PirateForm
                                        ships={shipOptions}
                                        initialPirate={pirate}
                                        onSave={(input) =>
                                            updatePirate(pirate.id, input)
                                        }
                                        onCancel={() => setEditingId(null)}
                                    />
                                ) : (
                                    <div className="shipList h-100">
                                        <h2>{pirate.name}</h2>
                                        <p className="shipStat">
                                            {pirate.shipName}
                                        </p>
                                        <p className="shipStat">
                                            {pirate.missingLimbs} missing limbs
                                        </p>
                                        <p className="shipStat">
                                            {" "}
                                            {pirate.parrotName ??
                                                "No parrot (sad)"}
                                        </p>
                                        <p className="shipStat">
                                            {pirate.rumPerDay} rum per day
                                        </p>
                                        <p className="shipStat">
                                            {pirate.loyalty}% loyal
                                        </p>
                                        <button
                                            className="me-2"
                                            onClick={() =>
                                                setEditingId(pirate.id)
                                            }>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                deletePirate(pirate)
                                            }>
                                            Walk the plank
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {data.items.length === 0 ? (
                        <p className="statusText">
                            No pirates here. Suspiciously quiet...
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

export default PiratesPage;
