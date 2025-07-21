import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs';
import { modelStatus } from '../../interfaces/machineLearning/modelStatus';
import { rainPrediction } from '../../interfaces/machineLearning/rainPrediction';
import { trainPrediction } from '../../interfaces/machineLearning/trainPrediction';

@Injectable({
  providedIn: 'root',
})

export class FastApiService {
  private apiUrl = environment.MLURL;

  constructor(private http: HttpClient) {}

  getRainPrediction(): Observable<rainPrediction> {
    if (environment.useMock) {
      const mockPrediction: rainPrediction = {
        prediction: false,
        probability: 0.0,
        timestamp: '2000-01-01T01:00:00.000',
      };
      console.log('Fake prediction.');
      return of(mockPrediction);
    } else {
      console.log('True prediction.');
      console.log('API URL:', this.apiUrl);
      return this.http.get<rainPrediction>(`${this.apiUrl}/predict`);
    }
  }

  trainModel(): Observable<trainPrediction>{
    return this.http.get<trainPrediction>(`${this.apiUrl}/train`)
  }

  getModelStatus(): Observable<modelStatus>{
    return this.http.get<modelStatus>(`${this.apiUrl}/model/status`)
  }

  downloadModel(): void {
    window.open(`${this.apiUrl}/download`, '_blank');
  }

}
