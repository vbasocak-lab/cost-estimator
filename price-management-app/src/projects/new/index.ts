export class ProjectManager {
    private projects: Map<string, any>;

    constructor() {
        this.projects = new Map();
    }

    createProject(projectId: string, projectData: any): void {
        if (this.projects.has(projectId)) {
            throw new Error(`Project with ID ${projectId} already exists.`);
        }
        this.projects.set(projectId, projectData);
    }

    getProject(projectId: string): any {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project with ID ${projectId} does not exist.`);
        }
        return this.projects.get(projectId);
    }
}