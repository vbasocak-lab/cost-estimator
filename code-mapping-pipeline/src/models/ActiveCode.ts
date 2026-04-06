export class ActiveCode {
    id: string;
    code: string;
    description: string;
    isActive: boolean;

    constructor(id: string, code: string, description: string, isActive: boolean = true) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.isActive = isActive;
    }

    activate() {
        this.isActive = true;
    }

    deactivate() {
        this.isActive = false;
    }

    updateCode(newCode: string) {
        this.code = newCode;
    }

    updateDescription(newDescription: string) {
        this.description = newDescription;
    }
}