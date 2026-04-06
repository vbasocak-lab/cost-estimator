export interface Bathroom {
    bathroom_level: number;
    bathroom_type: string;
    wc_type: string;
    shower_type: string;
    vanity_type: string;
    bathtub_type: string;
}

export interface Kitchen {
    kitchen_type: string;
    kitchen_credence_type: string;
    has_buanderie: boolean;
    has_cellier: boolean;
    cellier_storage_level: number;
}