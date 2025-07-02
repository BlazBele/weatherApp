import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { WeatherData } from '../../interfaces/weather-data';
import { WindData } from '../../interfaces/wind-data';


@Injectable({
  providedIn: 'root'
})
export class FlaskService {
  private apiUrl = environment.rpiApiUrl;

  constructor(private http: HttpClient) {}

getWindData(): Observable<WindData> {
  if (!environment.useMock) {
    console.log("USE MOCK");
    console.log(environment.useMock);

    const mockWindData: WindData = {
      timestamp: "02/07/2025 20:00:00",
      wind_direction: "Zahod",
      wind_speed: 0
    };

    return of(mockWindData);
  } else {

    return this.http.get<WeatherData>(`${this.apiUrl}/wind_data`);

  }
}
}
