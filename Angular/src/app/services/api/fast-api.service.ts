import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { rainPrediction } from '../../interfaces/rain-prediction';
import { of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})

export class FastApiService{
    private apiUrl = environment.MLURL;

  constructor(private http: HttpClient) {}


getRainPrediction(): Observable<rainPrediction> {
    if (environment.useMock) {
      const mockPrediction: rainPrediction = {
        prediction: false,
        probability: 0.0,
        timestamp: "2000-01-01T01:00:00.000"
      };
      console.log("Fake prediction.")
      return of(mockPrediction);
    } else {
      console.log("True prediction.")
      console.log("API URL:",this.apiUrl)
      return this.http.get<rainPrediction>(`${this.apiUrl}/predict`);
    }
  }

}
