export class WindowService {
    private windows: any[] = []; // Array to hold window data

    constructor() {
        // Initialize with some default window data if needed
    }

    // Method to calculate the area ratio of a window
    calculateWindowAreaRatio(window: any): number {
        const { windowAreaRatio } = window;
        return windowAreaRatio;
    }

    // Method to add a new window
    addWindow(window: any): void {
        this.windows.push(window);
    }

    // Method to get all windows
    getAllWindows(): any[] {
        return this.windows;
    }

    // Method to find a window by its type
    findWindowByType(type: string): any | undefined {
        return this.windows.find(window => window.windowGlazingType === type);
    }

    // Additional methods for managing window data can be added here
}