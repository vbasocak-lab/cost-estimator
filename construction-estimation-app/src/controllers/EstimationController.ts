export class EstimationController {
    private estimationService: EstimationService;

    constructor(estimationService: EstimationService) {
        this.estimationService = estimationService;
    }

    public createEstimation(req: Request, res: Response): void {
        const estimationData = req.body;
        const estimation = this.estimationService.createEstimation(estimationData);
        res.status(201).json(estimation);
    }

    public getEstimation(req: Request, res: Response): void {
        const estimationId = req.params.id;
        const estimation = this.estimationService.fetchEstimation(estimationId);
        if (estimation) {
            res.status(200).json(estimation);
        } else {
            res.status(404).json({ message: 'Estimation not found' });
        }
    }
}