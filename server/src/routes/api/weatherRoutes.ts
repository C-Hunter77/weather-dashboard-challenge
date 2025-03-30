import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    console.log('[POST /api/weather] city:', city);

    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const weatherData = await WeatherService.getWeatherForCity(city);
    await HistoryService.addCity(city);

    return res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ message: 'Failed to fetch search history' });
  }
});

router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await HistoryService.removeCity(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.json({ success: true, message: 'City removed from history' });
  } catch (error) {
    console.error('Error deleting city:', error);
    return res.status(500).json({ message: 'Failed to delete city' });
  }
});

export default router;
