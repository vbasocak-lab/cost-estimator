export interface BathroomConfig {
    bathroom_level: number;
    bathroom_type: string;
    wc_type: string;
    shower_type: string;
    vanity_type: string;
    bathtub_type: string;
    has_buanderie: boolean;
    has_cellier: boolean;
    cellier_storage_level: number;
}

export interface KitchenConfig {
    kitchen_type: string;
    kitchen_credence_type: string;
}