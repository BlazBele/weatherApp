import { Component, ViewChild } from '@angular/core';

export type ChartOptions = {
  series: any;
  chart: any;
  dataLabels: any;
  markers: any;
  title: any;
  fill: any;
  yaxis: any;
  xaxis: any;
  tooltip: any;
  stroke: any;
  annotations: any;
  colors: any;
};


@Component({
  selector: 'app-temperature',
  standalone: false,
  templateUrl: './temperature.component.html',
  styleUrl: './temperature.component.scss'
})
export class TemperatureComponent{
  @ViewChild('chart', { static: false }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  selectedPeriod: string = 'day';
  rangeStart: string;
  rangeEnd: string;

  constructor(private translate: TranslateService) {
    this.initChart();
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: this.translate.instant('temperature'),
          data: this.getDataForPeriod(this.selectedPeriod)
        }
      ],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: true }
      },
      dataLabels: { enabled: false },
      markers: { size: 0 },
      xaxis: {
        type: 'datetime',
        tickAmount: 6,
        min: this.getMinDateForPeriod(this.selectedPeriod),
        max: this.getMaxDateForPeriod(this.selectedPeriod)
      },
      tooltip: {
        x: { format: 'dd MMM yyyy' }
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 100] }
      },
      title: {
        text: this.translate.instant('temperatureOverTime'),
        align: 'left'
      },
      yaxis: {
        title: { text: '°C' }
      },
      stroke: { curve: 'smooth' },
      annotations: { xaxis: [], yaxis: [] },
      colors: ['#008FFB']
    };
  }

  onPeriodChange() {
    if (this.selectedPeriod !== 'range') {
      this.rangeStart = null;
      this.rangeEnd = null;
      this.updateChart();
    }
  }

  onRangeChange() {
    if (this.rangeStart && this.rangeEnd) {
      this.updateChart();
    }
  }

  updateChart() {
    const data = this.selectedPeriod === 'range' && this.rangeStart && this.rangeEnd
      ? this.getDataForRange(this.rangeStart, this.rangeEnd)
      : this.getDataForPeriod(this.selectedPeriod);

    this.chart.updateOptions({
      series: [{ data }],
      xaxis: {
        min: this.selectedPeriod === 'range' ? new Date(this.rangeStart).getTime() : this.getMinDateForPeriod(this.selectedPeriod),
        max: this.selectedPeriod === 'range' ? new Date(this.rangeEnd).getTime() : this.getMaxDateForPeriod(this.selectedPeriod)
      }
    }, false, true, true);
  }

  getDataForPeriod(period: string) {
    // Tukaj simuliraš ali kličes API glede na period
    // Za demo: vrni naključne podatke s časovnimi oznakami
    const now = new Date();

    switch (period) {
      case 'day': {
        // podatki po urah danes
        return Array.from({ length: 24 }, (_, i) => [new Date(now.getFullYear(), now.getMonth(), now.getDate(), i).getTime(), 15 + Math.random() * 10]);
      }
      case 'week': {
        // podatki za zadnjih 7 dni
        return Array.from({ length: 7 }, (_, i) => [now.getTime() - (6 - i) * 86400000, 15 + Math.random() * 10]);
      }
      case 'month': {
        // podatki za zadnjih 30 dni
        return Array.from({ length: 30 }, (_, i) => [now.getTime() - (29 - i) * 86400000, 15 + Math.random() * 10]);
      }
      case 'year': {
        // podatki za zadnjih 12 mesecev (prikaz po mesecih)
        return Array.from({ length: 12 }, (_, i) => [new Date(now.getFullYear(), now.getMonth() - (11 - i), 1).getTime(), 5 + Math.random() * 20]);
      }
      case 'all': {
        // npr. podatki za 3 leta
        return Array.from({ length: 1095 }, (_, i) => [now.getTime() - (1094 - i) * 86400000, 10 + Math.random() * 15]);
      }
      default:
        return [];
    }
  }

  getDataForRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    return Array.from({ length: days }, (_, i) => [startDate.getTime() + i * 86400000, 15 + Math.random() * 10]);
  }

  getMinDateForPeriod(period: string) {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      case 'week':
        return now.getTime() - 6 * 86400000;
      case 'month':
        return now.getTime() - 29 * 86400000;
      case 'year':
        return new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
      case 'all':
        return now.getTime() - 1094 * 86400000;
      default:
        return undefined;
    }
  }

  getMaxDateForPeriod(period: string) {
    return new Date().getTime();
  }
}