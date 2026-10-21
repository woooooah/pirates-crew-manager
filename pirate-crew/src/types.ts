export type Ship = {
    id: string;
    name: string;
    flag: string;
    cannons: number;
    sinkingRisk: number;
    crewCount: number;
    createdAt: string;
};

// what we SEND to the API (the database generates the rest)
export type ShipInput = Omit<Ship, "id" | "crewCount" | "createdAt">;

export type ShipOption = {
    id: string;
    name: string;
};

export type Pirate = {
    id: string;
    shipId: string;
    shipName: string;
    name: string;
    missingLimbs: number;
    parrotName: string | null;
    rumPerDay: number;
    loyalty: number;
    createdAt: string;
};

export type PirateInput = Omit<Pirate, "id" | "shipName" | "createdAt">;
