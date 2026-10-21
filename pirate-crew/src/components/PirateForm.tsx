import { useState, type SubmitEvent } from "react";
import type { Pirate, PirateInput, ShipOption } from "../types";

type PirateFormProps = {
    ships: ShipOption[];
    initialPirate?: Pirate;
    defaultShipId?: string;
    onSave: (pirate: PirateInput) => void;
    onCancel: () => void;
};

function PirateForm({
    ships,
    initialPirate,
    defaultShipId,
    onSave,
    onCancel,
}: PirateFormProps) {
    const [name, setName] = useState(initialPirate?.name ?? "");
    const [shipId, setShipId] = useState(
        initialPirate?.shipId ?? defaultShipId ?? ships[0]?.id ?? "",
    );
    const [missingLimbs, setMissingLimbs] = useState(
        initialPirate?.missingLimbs ?? 0,
    );
    const [parrotName, setParrotName] = useState(
        initialPirate?.parrotName ?? "",
    );
    const [rumPerDay, setRumPerDay] = useState(initialPirate?.rumPerDay ?? 1);
    const [loyalty, setLoyalty] = useState(initialPirate?.loyalty ?? 50);

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim() || !shipId) return;

        onSave({
            name: name.trim(),
            shipId,
            missingLimbs,
            parrotName: parrotName.trim() || null,
            rumPerDay,
            loyalty,
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`shipList mb-4 ${initialPirate ? "shipFormEdit" : "shipForm"}`}>
            <h2>{initialPirate ? " Edit pirate" : " New pirate"}</h2>

            <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="One-Eyed Willy"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Ship</label>
                <select
                    className="form-select"
                    value={shipId}
                    onChange={(e) => setShipId(e.target.value)}>
                    {ships.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Missing limbs</label>
                <input
                    type="number"
                    min={0}
                    max={4}
                    className="form-control"
                    value={missingLimbs}
                    onChange={(e) => setMissingLimbs(Number(e.target.value))}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Parrot name (optional)</label>
                <input
                    className="form-control"
                    value={parrotName}
                    onChange={(e) => setParrotName(e.target.value)}
                    placeholder="Captain Feathers"
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Rum per day</label>
                <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={rumPerDay}
                    onChange={(e) => setRumPerDay(Number(e.target.value))}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Loyalty: {loyalty}%</label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    className="form-range"
                    value={loyalty}
                    onChange={(e) => setLoyalty(Number(e.target.value))}
                />
            </div>

            <div className="d-flex gap-2">
                <button type="submit">
                    {initialPirate ? "Save changes " : "Recruit pirate "}
                </button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default PirateForm;
