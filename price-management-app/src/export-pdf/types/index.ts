export interface PDFOptions {
    pageSize: string;
    margin: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    orientation: 'portrait' | 'landscape';
}

export interface PDFDocument {
    title: string;
    author: string;
    content: string;
    options: PDFOptions;
}