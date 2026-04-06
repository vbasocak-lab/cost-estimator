export class Property {
    bedroom_count: number;
    bathroom_count: number;
    wc_count: number;
    room_count: number;
    has_stair: boolean;
    stair_type: string;
    stair_finish: string;

    constructor(
        bedroom_count: number,
        bathroom_count: number,
        wc_count: number,
        room_count: number,
        has_stair: boolean,
        stair_type: string,
        stair_finish: string
    ) {
        this.bedroom_count = bedroom_count;
        this.bathroom_count = bathroom_count;
        this.wc_count = wc_count;
        this.room_count = room_count;
        this.has_stair = has_stair;
        this.stair_type = stair_type;
        this.stair_finish = stair_finish;
    }
}