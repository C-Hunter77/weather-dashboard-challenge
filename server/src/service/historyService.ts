import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class City {
  constructor(public id: string, public name: string) {}
}

class HistoryService {
  private historyFile = path.join(__dirname, "../../data/searchHistory.json");

  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.historyFile, "utf-8");
      return JSON.parse(data) as City[];
    } catch (error) {
      console.error("Error reading history file:", error);
      return [];
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.historyFile, JSON.stringify(cities, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to history file:", error);
    }
  }

  async getCities(): Promise<City[]> {
    return await this.read();
  }

  async addCity(city: string): Promise<City> {
    const cities = await this.read();
    const newCity = new City(Date.now().toString(), city);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  async removeCity(id: string): Promise<boolean> {
    const cities = await this.read();
    const newCities = cities.filter(city => city.id !== id);

    if (cities.length === newCities.length) {
      return false; // City not found
    }

    await this.write(newCities);
    return true;
  }
}

export default new HistoryService();
