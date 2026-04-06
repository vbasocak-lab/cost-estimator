export class EstimationController {
    constructor(private estimationService: EstimationService) {}

    createEstimate(req, res) {
        const estimateData = req.body;
        this.estimationService.createEstimate(estimateData)
            .then(estimate => res.status(201).json(estimate))
            .catch(error => res.status(400).json({ error: error.message }));
    }

    getEstimates(req, res) {
        this.estimationService.getEstimates()
            .then(estimates => res.status(200).json(estimates))
            .catch(error => res.status(500).json({ error: error.message }));
    }

    deleteEstimate(req, res) {
        const estimateId = req.params.id;
        this.estimationService.deleteEstimate(estimateId)
            .then(() => res.status(204).send())
            .catch(error => res.status(404).json({ error: error.message }));
    }
}