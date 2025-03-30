import dotenv from 'dotenv';
dotenv.config();

class Weather {
  constructor(
    public location: string,
    public temperature: number,
    public humidity: number,
    public condition: string,
    public windSpeed: number,
    public icon: string,
    public date: string
  ) {}
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5/';
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }

  private async fetchCurrentWeather(city: string): Promise<any> {
    const url = `${this.baseURL}weather?q=${encodeURIComponent(city)}&units=imperial&appid=${this.apiKey}`;
    console.log('[Current Weather API] URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Current Weather API Error]', response.status, errorText);
      throw new Error('Failed to fetch current weather');
    }

    return response.json();
  }

  private async fetchForecast(city: string): Promise<any> {
    const url = `${this.baseURL}forecast?q=${encodeURIComponent(city)}&units=imperial&appid=${this.apiKey}`;
    console.log('[Forecast API] URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Forecast API Error]', response.status, errorText);
      throw new Error('Failed to fetch forecast');
    }

    return response.json();
  }

  private parseCurrentWeather(data: any): Weather {
    return new Weather(
      data.name,
      data.main.temp,
      data.main.humidity,
      data.weather[0].description,
      data.wind.speed,
      data.weather[0].icon,
      new Date(data.dt * 1000).toLocaleDateString()
    );
  }

  private parseForecast(data: any): Weather[] {
    return data.list
      .filter((_entry: any, index: number) => index % 8 === 0) // 5 days (3hr intervals)
      .map((entry: any) => {
        return new Weather(
          data.city.name,
          entry.main.temp,
          entry.main.humidity,
          entry.weather[0].description,
          entry.wind.speed,
          entry.weather[0].icon,
          new Date(entry.dt * 1000).toLocaleDateString()
        );
      });
  }

  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
      const currentData = await this.fetchCurrentWeather(city);
      const forecastData = await this.fetchForecast(city);

      const current = this.parseCurrentWeather(currentData);
      const forecast = this.parseForecast(forecastData);

      return { current, forecast };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      throw error;
    }
  }
}

export default new WeatherService();
