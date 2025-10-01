import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { WindData } from '../../interfaces/wind-data';


@Injectable({
  providedIn: 'root'
})
export class FlaskService {
  private apiUrl = environment.rpiApiUrl;

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
    
  return this.http.get<WindData>(`${this.apiUrl}/wind_data`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });

  }
}
}
