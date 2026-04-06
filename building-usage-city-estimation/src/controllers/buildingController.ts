import { Request, Response } from 'express';
import { BuildingService } from '../services/buildingService';

export class BuildingController {
    private buildingService: BuildingService;

    constructor() {
        this.buildingService = new BuildingService();
    }

    public async getBuilding(req: Request, res: Response): Promise<void> {
        try {
            const buildingId = req.params.id;
            const building = await this.buildingService.getBuilding(buildingId);
            res.status(200).json(building);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async createBuilding(req: Request, res: Response): Promise<void> {
        try {
            const buildingData = req.body;
            const newBuilding = await this.buildingService.createBuilding(buildingData);
            res.status(201).json(newBuilding);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    public async updateBuilding(req: Request, res: Response): Promise<void> {
        try {
            const buildingId = req.params.id;
            const buildingData = req.body;
            const updatedBuilding = await this.buildingService.updateBuilding(buildingId, buildingData);
            res.status(200).json(updatedBuilding);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}