import { useState, type SubmitEvent } from "react";
import type { Ship, ShipInput } from "../types";

type ShipFormProps = {
    initialShip?: Ship;
    onSave: (ship: ShipInput) => void;
    onCancel: () => void;
};

function ShipForm({ initialShip, onSave, onCancel }: ShipFormProps) {
    const [name, setName] = useState(initialShip?.name ?? "");
    const [flag, setFlag] = useState(initialShip?.flag ?? "");
    const [cannons, setCannons] = useState(initialShip?.cannons ?? 0);
    const [sinkingRisk, setSinkingRisk] = useState(
        initialShip?.sinkingRisk ?? 50,
    );

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim()) return;

        onSave({
            name: name.trim(),
            flag: flag.trim(),
            cannons,
            sinkingRisk,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={
                initialShip
                    ? "shipList shipFormEdit mb-4"
                    : "shipList shipForm mb-4"
            }>
            <h2>{initialShip ? " Edit ship" : " New ship"}</h2>

            <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="The Salty Pretzel"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Flag</label>
                <input
                    className="form-control"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="Skull with a monocle"
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Cannons</label>
                <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={cannons}
                    onChange={(e) => setCannons(Number(e.target.value))}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Sinking risk: {sinkingRisk}%
                </label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    className="form-range"
                    value={sinkingRisk}
                    onChange={(e) => setSinkingRisk(Number(e.target.value))}
                />
            </div>

            <div className="d-flex gap-2">
                <button type="submit">
                    {initialShip ? "Save changes " : "Launch ship "}
                </button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ShipForm;
