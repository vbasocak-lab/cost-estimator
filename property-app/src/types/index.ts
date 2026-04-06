export interface PropertyType {
    bedroom_count: number;
    bathroom_count: number;
    wc_count: number;
    room_count: number;
    has_stair: boolean;
    stair_type?: string; // Optional property
    stair_finish?: string; // Optional property
}