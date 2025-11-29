import { offlineStorageService  from './offlineStorageService';

interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
    current?: number;
  ;
  condition: string;
  icon: string;
  precipitation: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  ;


interface ForecastData {
  location: string;
  forecast: WeatherData[];


export class WeatherService {
  private static API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
  private static BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';
  
  /**
   * Get weather forecast for a location and date range
   */
  static async getForecast(
    latitude: number, 
    longitude: number, 
    startDate: Date,
    endDate: Date
  ): Promise<ForecastData | null> {
    try {
      // Check if we have cached data
      const cachedData = await this.getCachedForecast(latitude, longitude, startDate, endDate);
      if (cachedData) {
        return cachedData;
      
      
      // If online, fetch from API
      if (offlineStorageService.isOnline()) {
        const forecast = await this.fetchForecastFromAPI(latitude, longitude, startDate, endDate);
        if (forecast) {
          // Cache the data
          await this.cacheForecast(latitude, longitude, forecast);
          return forecast;
        
      
      
      return null;
     catch (error) {
      console.error('Error getting weather forecast:', error);
      return null;
    
  
  
  /**
   * Fetch forecast from OpenWeatherMap API
   */
  private static async fetchForecastFromAPI(
    latitude: number, 
    longitude: number, 
    startDate: Date,
    endDate: Date
  ): Promise<ForecastData | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL?lat=${latitude&lon=${longitude&appid=${this.API_KEY&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status`);
      
      
      const data = await response.json();
      
      // Transform API response to our format
      const forecast: ForecastData = {
        location: `${latitude,${longitude`,
        forecast: data.daily.map((day: any) => ({
          date: new Date(day.dt * 1000).toISOString().split('T')[0],
          temperature: {
            min: day.temp.min,
            max: day.temp.max,
            current: day.temp.day,
          ,
          condition: day.weather[0].main,
          icon: day.weather[0].icon,
          precipitation: day.pop * 100, // Probability of precipitation
          humidity: day.humidity,
          wind: {
            speed: day.wind_speed,
            direction: day.wind_deg,
          ,
        )),
      ;
      
      return forecast;
     catch (error) {
      console.error('Error fetching weather from API:', error);
      return null;
    
  
  
  /**
   * Get cached forecast data
   */
  private static async getCachedForecast(
    latitude: number, 
    longitude: number, 
    startDate: Date,
    endDate: Date
  ): Promise<ForecastData | null> {
    try {
      const weatherData = await offlineStorageService.getWeatherData();
      const locationKey = `${latitude,${longitude`;
      
      if (weatherData[locationKey]) {
        const cached = weatherData[locationKey];
        
        // Check if data is still valid (less than 6 hours old)
        const now = Date.now();
        const sixHours = 6 * 60 * 60 * 1000;
        
        if (now - cached.timestamp < sixHours) {
          return cached.data;
        
      
      
      return null;
     catch (error) {
      console.error('Error getting cached weather:', error);
      return null;
    
  
  
  /**
   * Cache forecast data
   */
  private static async cacheForecast(
    latitude: number, 
    longitude: number, 
    forecast: ForecastData
  ): Promise<void> {
    try {
      const locationKey = `${latitude,${longitude`;
      await offlineStorageService.saveWeatherData(locationKey, {
        data: forecast,
        timestamp: Date.now(),
      );
     catch (error) {
      console.error('Error caching weather data:', error);
    
  
  
  /**
   * Get weather icon based on condition
   */
  static getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
    ;
    
    return iconMap[condition] || '❓';
  
  
  /**
   * Format temperature with units
   */
  static formatTemperature(temp: number): string {
    return `${Math.round(temp)°C`;
  
  
  /**
   * Format precipitation probability
   */
  static formatPrecipitation(precip: number): string {
    return `${Math.round(precip)%`;
  


export default WeatherService;