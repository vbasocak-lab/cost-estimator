export class ExportController {
    constructor(private pdfExportService: PdfExportService) {}

    exportToPDF(req, res) {
        const data = req.body; // Assuming data to export is sent in the request body
        this.pdfExportService.generatePDF(data)
            .then(pdfBuffer => {
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="export.pdf"',
                    'Content-Length': pdfBuffer.length
                });
                res.send(pdfBuffer);
            })
            .catch(error => {
                res.status(500).send({ error: 'Failed to export to PDF' });
            });
    }
}