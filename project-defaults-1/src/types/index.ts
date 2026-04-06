export interface ProjectDefaults {
    projectName: string;
    version: string;
    author: string;
    license: string;
    description: string;
}

export interface Config {
    apiUrl: string;
    timeout: number;
    retries: number;
}

export type Environment = 'development' | 'production' | 'test';