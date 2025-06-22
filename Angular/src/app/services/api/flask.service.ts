import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { WindData } from '../../interfaces/wind-data';


@Injectable({
  providedIn: 'root'
})
export class FlaskService {
  private apiUrl = environment.rpiApiUrl;

  constructor(private http: HttpClient) {}

  getWindData(): Observable<WindData> {
    return this.http.get<WindData>(`${this.apiUrl}/wind_data`);
  }
}
