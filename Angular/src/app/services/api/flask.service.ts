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
  if (environment.useMock) {

    console.log(environment.useMock);

    const mockWindData: WindData = {
      timestamp: "2000-01-01T01:00:00.000",
      wind_direction: "S",
      wind_speed: 0
    };

    return of(mockWindData);
  } else {

    return this.http.get<WeatherData>(`${this.apiUrl}/wind_data`);

  }
}
}
