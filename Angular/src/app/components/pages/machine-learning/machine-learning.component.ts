import { Component, OnInit } from '@angular/core';
import { FastApiService } from '../../../services/api/fast-api.service';
import { trainPrediction } from '../../../interfaces/machineLearning/trainPrediction';
import { rainPrediction } from '../../../interfaces/machineLearning/rainPrediction';
import { modelStatus } from '../../../interfaces/machineLearning/modelStatus';
import { RouteConfigLoadEnd } from '@angular/router';
import { TimestampService } from '../../../services/timestamp.service';
@Component({
  selector: 'app-machine-learning',
  standalone: false,
  templateUrl: './machine-learning.component.html',
  styleUrl: './machine-learning.component.scss'
})

export class MachineLearningComponent implements OnInit{

  modelStatus : modelStatus | null = null;
  trainPrediction : trainPrediction | null = null;
  rainPrediction : rainPrediction | null = null;
  constructor(
    private fastApi: FastApiService,
    private timestampService: TimestampService
  ){}

  ngOnInit(): void {
    this.status()
  }

  train() {
    this.fastApi.trainModel().subscribe({
      next: (res) => {
        this.trainPrediction = res;
        this.trainPrediction.accuracy = Math.round(this.trainPrediction.accuracy * 10000) / 100;
        this.trainPrediction.timestamp = this.timestampService.formatDateString(res.timestamp, 0)
      },
      error: (err) => {
        console.error("Napaka pri pridobivanju statusa modela:", err);
      }
    })
  }

  predict() {
    this.fastApi.getRainPrediction().subscribe({
      next: (res) => {
        this.rainPrediction = res;
        this.rainPrediction.timestamp = this.timestampService.formatDateString(res.timestamp, 0)
        
      },
      error: (err) => {
        console.error("Napaka pri napovadovanju:", err);       
      }
    })
  }

  status() {
    this.fastApi.getModelStatus().subscribe({
      next: (res) => {
        this.modelStatus = res;
        this.modelStatus.timestamp = this.timestampService.formatDateString(res.timestamp, 0)
      },
      error: (err) => {
        console.error("Napaka pri pridobivanju statusa:", err);         
      }
    })
  }


}
