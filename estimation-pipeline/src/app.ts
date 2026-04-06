import { runPipeline } from './pipeline';

async function main() {
    try {
        await runPipeline();
    } catch (error) {
        console.error('Error running the estimation pipeline:', error);
    }
}

main();