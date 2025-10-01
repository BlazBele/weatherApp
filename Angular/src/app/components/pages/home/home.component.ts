import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WeatherData } from '../../../interfaces/weather-data';
import { SupabaseService } from '../../../services/api/supabase.service';
import { FlaskService} from '../../../services/api/flask.service';
import { firstValueFrom } from 'rxjs';

import { TimestampService } from '../../../services/timestamp.service';
import { WindData } from '../../../interfaces/wind-data';
import { rainPrediction } from '../../../interfaces/machineLearning/rainPrediction';
import { FastApiService } from '../../../services/api/fast-api.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  rainPrediction?: rainPrediction;
  weather: WeatherData = {
    temperature: 0,
    previous_temperature: 0,
    humidity: 0,
    previous_humidity: 0,
    pressure0: 0,
    previous_pressure0: 0,
    wind_speed: 0,
    previous_wind_speed: 0,
    wind_direction: '',
    previous_wind_direction: '',
    timestamp: '',
    created_at: '',
    rain: false,
    id: 1
  };
  


  constructor(
    private supabaseService: SupabaseService,
    private apiService: FlaskService,
    private timestampService: TimestampService,
    private fastApiService: FastApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWeatherFromSupabase();
    //this.refreshRainPrediction();
  }

  loadWeatherFromSupabase(): void {
    this.supabaseService.getDailyWeatherSummary().subscribe(data => {
      //console.log('Prejeto iz Supabase:', data);
      if (data) {
        const formattedCreatedAt = this.timestampService.formatDateString(data.created_at);
        this.weather = {
          ...data,
          created_at: formattedCreatedAt,
        };
        //this.cdr.detectChanges(); 
      }
      
    });
  }

  async refreshWindData(): Promise<void> {
    try {
      const wind: WindData = await firstValueFrom(this.apiService.getWindData());
      this.weather.timestamp = this.timestampService.formatDateString(wind.timestamp);
      this.weather.wind_speed = wind.wind_speed;
      this.weather.wind_direction = wind.wind_direction;
      
      if(this.weather.daily_max_wind_speed === undefined || wind.wind_speed > this.weather.daily_max_wind_speed) {
        this.weather.daily_max_wind_speed = wind.wind_speed;
      }

    } catch (error) {
      console.error('Napaka pri osvežitvi vetra:', error);
    }
  }

  async refreshRainPrediction(): Promise<void> {
    try {
      const data = await firstValueFrom(this.fastApiService.getRainPrediction());
      this.rainPrediction = data;
      this.rainPrediction.probability = data.probability * 100;
      this.rainPrediction.timestamp = this.timestampService.formatDateString(data.timestamp);
    } catch (error) {
      console.error('Napaka pri osvežitvi napovedi dežja:', error);
    }
  }


}
