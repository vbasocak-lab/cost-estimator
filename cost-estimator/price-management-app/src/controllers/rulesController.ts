import { Request, Response } from 'express';
import { RulesService } from '../services/rulesService';
import { Rule } from '../models/rule';

export class RulesController {
    private rulesService: RulesService;

    constructor() {
        this.rulesService = new RulesService();
    }

    public addRule = (req: Request, res: Response): void => {
        const rule: Rule = req.body;
        this.rulesService.addRule(rule);
        res.status(201).send(rule);
    };

    public getRules = (req: Request, res: Response): void => {
        const rules = this.rulesService.getRules();
        res.status(200).send(rules);
    };

    public deleteRule = (req: Request, res: Response): void => {
        const ruleId: string = req.params.id;
        this.rulesService.deleteRule(ruleId);
        res.status(204).send();
    };
}