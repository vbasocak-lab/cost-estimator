export class LotsController {
    private lotsService: any; // Replace 'any' with the actual type of LotsService

    constructor(lotsService: any) { // Replace 'any' with the actual type of LotsService
        this.lotsService = lotsService;
    }

    public createLot(req: any, res: any): void { // Replace 'any' with actual request and response types
        const lotData = req.body;
        const newLot = this.lotsService.createLot(lotData);
        res.status(201).json(newLot);
    }

    public getLots(req: any, res: any): void { // Replace 'any' with actual request and response types
        const lots = this.lotsService.getLots();
        res.status(200).json(lots);
    }

    public deleteLot(req: any, res: any): void { // Replace 'any' with actual request and response types
        const lotId = req.params.id;
        this.lotsService.deleteLot(lotId);
        res.status(204).send();
    }
}