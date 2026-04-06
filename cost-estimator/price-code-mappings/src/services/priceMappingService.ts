import { PriceCodeMapping } from '../models/priceCodeMapping';

export class PriceMappingService {
    private mappings: PriceCodeMapping[] = [];

    public fetchMappings(): PriceCodeMapping[] {
        return this.mappings;
    }

    public saveMapping(mapping: PriceCodeMapping): void {
        this.mappings.push(mapping);
    }
}