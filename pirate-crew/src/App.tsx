import { useState } from "react";
import "./App.css";
import flagImg from "./assets/pixil-frame-0.png";
import PiratesPage from "./components/PiratesPage";
import ShipsPage from "./components/ShipsPage";
import type { Ship } from "./types";

type View = "ships" | "pirates";

function App() {
    const [view, setView] = useState<View>("ships");
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

    function goTo(newView: View) {
        setView(newView);
        setSelectedShip(null);
    }

    return (
        <div>
            <header className="pirateHeader">
                <img src={flagImg} alt="Pirate flag" className="headerIcon" />
                <h1>Pirate Crew Manager</h1>
                <p className="subtitle">
                    ~ keep yer ships afloat & yer crew loyal ~
                </p>
            </header>

            <nav className="pirateNav">
                <button
                    className={view === "ships" ? "active" : ""}
                    onClick={() => goTo("ships")}>
                    Ships
                </button>
                <button
                    className={view === "pirates" ? "active" : ""}
                    onClick={() => goTo("pirates")}>
                    Pirates
                </button>
            </nav>

            {view === "ships" && selectedShip && (
                <>
                    <div className="text-center mb-4">
                        <button
                            className="backButton"
                            onClick={() => setSelectedShip(null)}>
                            ← Back to ships
                        </button>
                        <h2 className="pageTitle">
                            Crew of {selectedShip.name}
                        </h2>
                    </div>
                    <PiratesPage
                        key={selectedShip.id}
                        shipId={selectedShip.id}
                    />
                </>
            )}

            {view === "ships" && !selectedShip && (
                <ShipsPage onViewCrew={setSelectedShip} />
            )}

            {view === "pirates" && <PiratesPage key="all" />}
        </div>
    );
}

export default App;
