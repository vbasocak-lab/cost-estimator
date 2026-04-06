export class MappingRule {
    constructor(public id: string, public description: string, public apply: (activeCodes: ActiveCode[]) => ActiveCode[]) {}

    static fromJSON(json: any): MappingRule {
        return new MappingRule(json.id, json.description, json.apply);
    }
}