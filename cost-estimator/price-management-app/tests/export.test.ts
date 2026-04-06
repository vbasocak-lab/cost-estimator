import { ExportController } from '../src/controllers/exportController';
import { PdfExportService } from '../src/services/pdfExportService';

describe('ExportController', () => {
    let exportController: ExportController;
    let pdfExportService: PdfExportService;

    beforeEach(() => {
        pdfExportService = new PdfExportService();
        exportController = new ExportController(pdfExportService);
    });

    it('should export data to PDF', async () => {
        const mockData = { title: 'Test Report', content: 'This is a test.' };
        const pdfExportSpy = jest.spyOn(pdfExportService, 'exportToPDF').mockResolvedValue('PDF generated');

        const result = await exportController.exportToPDF(mockData);

        expect(pdfExportSpy).toHaveBeenCalledWith(mockData);
        expect(result).toBe('PDF generated');
    });

    it('should handle errors during PDF export', async () => {
        const mockData = { title: 'Test Report', content: 'This is a test.' };
        const pdfExportSpy = jest.spyOn(pdfExportService, 'exportToPDF').mockRejectedValue(new Error('Export failed'));

        await expect(exportController.exportToPDF(mockData)).rejects.toThrow('Export failed');
    });
});