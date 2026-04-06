export class DoorService {
    private doorTypes: string[];
    private interiorDoorCount: number;

    constructor() {
        this.doorTypes = [];
        this.interiorDoorCount = 0;
    }

    addDoorType(doorType: string): void {
        if (!this.doorTypes.includes(doorType)) {
            this.doorTypes.push(doorType);
        }
    }

    removeDoorType(doorType: string): void {
        this.doorTypes = this.doorTypes.filter(type => type !== doorType);
    }

    setInteriorDoorCount(count: number): void {
        if (count >= 0) {
            this.interiorDoorCount = count;
        }
    }

    getDoorTypes(): string[] {
        return this.doorTypes;
    }

    getInteriorDoorCount(): number {
        return this.interiorDoorCount;
    }
}