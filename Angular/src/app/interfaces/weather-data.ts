export interface WeatherData {
  temperature: number;      
  humidity: number;         
  pressure0: number;        
  wind_speed: number;      
  wind_direction: string;   
  timestamp: string;
  created_at: string;
  //Dnevni
  min_temperature?: number;
  max_temperature?: number;
  min_humidity?: number;
  max_humidity?: number;
  min_pressure?: number;
  max_pressure?: number;
  max_wind_speed?: number;
}
