import { Request, Response } from 'express';
import { PriceMappingService } from '../services/priceMappingService';

export class PriceMappingController {
    private priceMappingService: PriceMappingService;

    constructor() {
        this.priceMappingService = new PriceMappingService();
    }

    public async getPriceMappings(req: Request, res: Response): Promise<void> {
        try {
            const mappings = await this.priceMappingService.fetchMappings();
            res.status(200).json(mappings);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving price mappings', error });
        }
    }

    public async createPriceMapping(req: Request, res: Response): Promise<void> {
        try {
            const newMapping = await this.priceMappingService.saveMapping(req.body);
            res.status(201).json(newMapping);
        } catch (error) {
            res.status(500).json({ message: 'Error creating price mapping', error });
        }
    }
}