export type Project = {
    name: string;
    description?: string;
    activeCodes: string[];
    // Add other relevant properties as needed
};

export type CodeMapping = {
    code: string;
    mappedValue: string;
};

export type Quantity = {
    code: string;
    quantity: number;
};

export interface LotLine {
    code: string;
    quantity: number;
    // Add other relevant properties as needed
}