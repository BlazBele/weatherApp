import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WeatherData } from '../../interfaces/weather-data';
import { WindData } from '../../interfaces/wind-data';


@Injectable({
  providedIn: 'root'
})
export class FlaskService {
  private apiUrl = environment.rpiApiUrl;
  private credentials = btoa(`${environment.ngrokUsername}:${environment.ngrokPassword}`);
  
  constructor(private http: HttpClient) {}

//PRIDOBI PODATKE O VETRU
getWindData(): Observable<WindData> {
  if (environment.useMock) {

    const mockWindData: WindData = {
      timestamp: "01/01/2000 01:00:00",
      wind_direction: "S",
      wind_speed: 0
    };
    console.log("Fake wind data.")
    return of(mockWindData);
  } else {
    console.log("True wind data.")
  console.log(this.credentials)
  const headers = new HttpHeaders({
    'Authorization': `Basic ${this.credentials}`,
    'ngrok-skip-browser-warning': 'true'
  });
  
  return this.http.get<WindData>(`${this.apiUrl}/wind_data`, { headers });

  }
}
}
