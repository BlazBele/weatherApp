export interface WeatherData {
  temperature: number;
  previous_temperature?: number;
  daily_min_temperature?: number;
  daily_max_temperature?: number;

  humidity: number;
  previous_humidity?: number;
  daily_min_humidity?: number;
  daily_max_humidity?: number;
  pressure?: number;
  pressure0: number;
  previous_pressure0?: number;
  daily_min_pressure0?: number;
  daily_max_pressure0?: number;

  wind_speed: number;
  previous_wind_speed?: number;
  daily_min_wind_speed?: number;
  daily_max_wind_speed?: number;

  wind_direction: string;
  previous_wind_direction?: string;

  timestamp: string;
  created_at: string;
  rain: boolean;
  id: number;
}
