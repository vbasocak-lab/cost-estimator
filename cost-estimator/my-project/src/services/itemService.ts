import { Item } from '../models/item';

export class ItemService {
    private items: Item[] = [];

    public createItem(itemData: Omit<Item, 'id'>): Item {
        const newItem: Item = { id: this.generateId(), ...itemData };
        this.items.push(newItem);
        return newItem;
    }

    public updateItem(id: number, updatedData: Partial<Item>): Item | undefined {
        const itemIndex = this.items.findIndex(item => item.id === id);
        if (itemIndex === -1) return undefined;

        const updatedItem = { ...this.items[itemIndex], ...updatedData };
        this.items[itemIndex] = updatedItem;
        return updatedItem;
    }

    public getItem(id: number): Item | undefined {
        return this.items.find(item => item.id === id);
    }

    public getAllItems(): Item[] {
        return this.items;
    }

    private generateId(): number {
        return this.items.length > 0 ? Math.max(...this.items.map(item => item.id)) + 1 : 1;
    }
}