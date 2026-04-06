export interface Building {
    id: number;
    name: string;
    address: string;
    cityId: number; // Foreign key to associate with a city
}