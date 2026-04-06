export class PdfExportService {
    private templatePath: string;

    constructor(templatePath: string) {
        this.templatePath = templatePath;
    }

    public async exportToPDF(data: any): Promise<Buffer> {
        const Handlebars = require('handlebars');
        const fs = require('fs').promises;
        const pdf = require('html-pdf');

        const templateSource = await fs.readFile(this.templatePath, 'utf-8');
        const template = Handlebars.compile(templateSource);
        const html = template(data);

        return new Promise((resolve, reject) => {
            pdf.create(html).toBuffer((err: any, buffer: Buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(buffer);
            });
        });
    }
}