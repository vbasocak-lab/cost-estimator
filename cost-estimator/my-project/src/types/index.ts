export interface Item {
    id: string;
    inputKey: string;
    inputValue: string;
    targetLot: string;
    defaultCodes: string[];
    overrideCodes: string[];
    replaceMode: boolean;
    quantityMode: string;
    quantityValue: number;
    priority: number;
    isActive: boolean;
}