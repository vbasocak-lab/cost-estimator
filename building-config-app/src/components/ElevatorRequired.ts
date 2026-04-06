export class ElevatorRequired {
    private required: boolean;

    constructor(required: boolean) {
        this.required = required;
    }

    public isElevatorRequired(): boolean {
        return this.required;
    }

    public setElevatorRequirement(required: boolean): void {
        this.required = required;
    }
}