export class CityService {
    private cities: City[] = [];

    public getCities(): City[] {
        return this.cities;
    }

    public getCityById(id: number): City | undefined {
        return this.cities.find(city => city.id === id);
    }

    public createCity(city: City): City {
        this.cities.push(city);
        return city;
    }

    public updateCity(id: number, updatedCity: City): City | undefined {
        const index = this.cities.findIndex(city => city.id === id);
        if (index !== -1) {
            this.cities[index] = { ...this.cities[index], ...updatedCity };
            return this.cities[index];
        }
        return undefined;
    }

    public deleteCity(id: number): boolean {
        const index = this.cities.findIndex(city => city.id === id);
        if (index !== -1) {
            this.cities.splice(index, 1);
            return true;
        }
        return false;
    }
}