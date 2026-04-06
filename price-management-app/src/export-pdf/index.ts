export class PDFExporter {
    private pdfOptions: PDFOptions;

    constructor() {
        this.pdfOptions = {
            margin: 10,
            format: 'A4',
            orientation: 'portrait',
        };
    }

    setPDFOptions(options: PDFOptions) {
        this.pdfOptions = { ...this.pdfOptions, ...options };
    }

    exportToPDF(data: any, fileName: string): void {
        // Logic to convert data to PDF format and save it with the given file name
        console.log(`Exporting data to PDF: ${fileName} with options:`, this.pdfOptions);
    }
}

export interface PDFOptions {
    margin?: number;
    format?: string;
    orientation?: 'portrait' | 'landscape';
}

export interface PDFDocument {
    title: string;
    content: string;
    author?: string;
}