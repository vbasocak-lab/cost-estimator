import { Request, Response } from 'express';
import { Property } from '../models/property';

export class PropertyController {
    private properties: Property[] = [];

    public createProperty(req: Request, res: Response): void {
        const newProperty = new Property(req.body);
        this.properties.push(newProperty);
        res.status(201).json(newProperty);
    }

    public getProperty(req: Request, res: Response): void {
        const propertyId = req.params.id;
        const property = this.properties.find(prop => prop.id === propertyId);
        if (property) {
            res.status(200).json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    }

    public updateProperty(req: Request, res: Response): void {
        const propertyId = req.params.id;
        const propertyIndex = this.properties.findIndex(prop => prop.id === propertyId);
        if (propertyIndex !== -1) {
            const updatedProperty = { ...this.properties[propertyIndex], ...req.body };
            this.properties[propertyIndex] = updatedProperty;
            res.status(200).json(updatedProperty);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    }

    public deleteProperty(req: Request, res: Response): void {
        const propertyId = req.params.id;
        const propertyIndex = this.properties.findIndex(prop => prop.id === propertyId);
        if (propertyIndex !== -1) {
            this.properties.splice(propertyIndex, 1);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    }
}