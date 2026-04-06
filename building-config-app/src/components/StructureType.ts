class StructureType {
    constructor(public type: string) {}

    getType(): string {
        return this.type;
    }

    setType(type: string): void {
        this.type = type;
    }
}