export class Item {
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

    constructor(
        id: string,
        inputKey: string,
        inputValue: string,
        targetLot: string,
        defaultCodes: string[],
        overrideCodes: string[],
        replaceMode: boolean,
        quantityMode: string,
        quantityValue: number,
        priority: number,
        isActive: boolean
    ) {
        this.id = id;
        this.inputKey = inputKey;
        this.inputValue = inputValue;
        this.targetLot = targetLot;
        this.defaultCodes = defaultCodes;
        this.overrideCodes = overrideCodes;
        this.replaceMode = replaceMode;
        this.quantityMode = quantityMode;
        this.quantityValue = quantityValue;
        this.priority = priority;
        this.isActive = isActive;
    }

    // Additional methods for manipulating item data can be added here
}