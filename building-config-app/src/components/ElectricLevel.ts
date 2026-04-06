export class ElectricLevel {
    private level: string;

    constructor(level: string) {
        this.level = level;
    }

    public getLevel(): string {
        return this.level;
    }

    public setLevel(level: string): void {
        this.level = level;
    }

    public isHighVoltage(): boolean {
        return this.level === 'High Voltage';
    }

    public isLowVoltage(): boolean {
        return this.level === 'Low Voltage';
    }
}