export interface Building {
    id: number;
    name: string;
    address: string;
}

export interface City {
    id: number;
    name: string;
    population: number;
}

export interface EstimationMode {
    id: number;
    modeType: string;
    description: string;
}