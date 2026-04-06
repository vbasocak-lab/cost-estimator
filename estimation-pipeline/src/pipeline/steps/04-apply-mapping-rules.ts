import { MappingRule } from '../types';
import { InputData, MappedData } from '../models/input';
import mappingRules from '../data/mapping-rules.json';

export function applyMappingRules(inputs: InputData): MappedData {
    const mappedData: MappedData = {};

    for (const rule of mappingRules as MappingRule[]) {
        const { source, target } = rule;
        if (inputs[source] !== undefined) {
            mappedData[target] = inputs[source];
        }
    }

    return mappedData;
}