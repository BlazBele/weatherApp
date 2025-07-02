import { Component, OnInit } from '@angular/core';
import { WeatherData } from '../../../interfaces/weather-data';
import { SupabaseService } from '../../../services/api/supabase.service';
import { FlaskService} from '../../../services/api/flask.service';
import { firstValueFrom } from 'rxjs';
import { WindData } from '../../../interfaces/wind-data';
import { TimestampService } from '../../../services/timestamp.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  weather: WeatherData = {
    temperature: 0,
    humidity: 0,
    pressure0: 0,
    wind_speed: 0,
    wind_direction: '',
    timestamp: '',
    created_at: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private apiService: FlaskService,
    private timestampService: TimestampService
  ) {}

  ngOnInit(): void {
    this.loadDailyWeatherSummary();
  }

  loadDailyWeatherSummary(): void {
    this.supabaseService.getDailyWeatherSummary().subscribe(data => {
      if (data) {
        // Formatiraj created_at če obstaja (trenutne podatke lahko formatiraš po potrebi)
        const formattedCreatedAt = data.created_at 
          ? this.timestampService.formatDateString(data.created_at) 
          : '';

        // Pripravi objekt weather s trenutnimi in dnevnim min/max podatki
        this.weather = {
          temperature: data.current_temperature,
          humidity: data.current_humidity,
          pressure0: data.current_pressure,
          wind_speed: data.current_wind_speed,
          wind_direction: data.current_wind_direction,
          timestamp: data.timestamp || '',
          created_at: formattedCreatedAt,

          min_temperature: data.min_temperature,
          max_temperature: data.max_temperature,
          min_humidity: data.min_humidity,
          max_humidity: data.max_humidity,
          min_pressure: data.min_pressure,
          max_pressure: data.max_pressure,
          max_wind_speed: data.max_wind_speed
        };
      }
    });
  }
