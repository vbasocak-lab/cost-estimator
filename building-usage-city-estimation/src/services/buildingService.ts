export class BuildingService {
    private buildings: any[] = []; // This will hold the building data

    constructor() {
        // Initialize with some dummy data if needed
        this.buildings = [];
    }

    public getAllBuildings(): any[] {
        return this.buildings;
    }

    public getBuilding(id: number): any | undefined {
        return this.buildings.find(building => building.id === id);
    }

    public createBuilding(buildingData: any): void {
        const newBuilding = { id: this.buildings.length + 1, ...buildingData };
        this.buildings.push(newBuilding);
    }

    public updateBuilding(id: number, updatedData: any): boolean {
        const index = this.buildings.findIndex(building => building.id === id);
        if (index !== -1) {
            this.buildings[index] = { ...this.buildings[index], ...updatedData };
            return true;
        }
        return false;
    }

    public deleteBuilding(id: number): boolean {
        const index = this.buildings.findIndex(building => building.id === id);
        if (index !== -1) {
            this.buildings.splice(index, 1);
            return true;
        }
        return false;
    }
}