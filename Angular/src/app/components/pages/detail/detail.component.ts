import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { WeatherData } from '../../../interfaces/weather-data';
import { SupabaseService } from '../../../services/api/supabase.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  standalone: false,
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  @Input() parameterName: 'temperature' | 'humidity' | 'wind_speed' = 'temperature';
  @Input() parameterLabel: string = 'Temperature'; // labela za prikaz in prevode
  @Input() parameterUnit: string = '°C'; // merska enota
  parameter: string = '';

  public selectedDate: string = new Date().toISOString().split('T')[0];
  public customStartDate: string = '';
  public customEndDate: string = '';
  public selectedPeriod: 'day' | 'week' | 'month' | '6months' | 'year' | 'custom' = 'day';

  public paramMin: number | null = null;
  public paramMax: number | null = null;
  public paramAvg: number | null = null;

  public today: string = new Date().toISOString().split('T')[0];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        fill: true,
        tension: 0.4,
        borderColor: 'blue',
        backgroundColor: 'rgba(0,123,255,0.2)',
        pointBackgroundColor: 'blue',
      },
    ],
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };



  constructor(private supabaseService: SupabaseService, private route: ActivatedRoute) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const param = params.get('parameter') ?? 'temperature';
    this.parameter = param;

    // Nastavi vse ostale podatke glede na parameter
    switch (param) {
      case 'temperature':
        this.parameterName = 'temperature';
        this.parameterLabel = 'temperature';
        this.parameterUnit = '°C';
        break;
      case 'humidity':
        this.parameterName = 'humidity';
        this.parameterLabel = 'humidity';
        this.parameterUnit = '%';
        break;
      case 'windSpeed':
        this.parameterName = 'wind_speed';
        this.parameterLabel = 'wind_speed';
        this.parameterUnit = 'km/h';
        break;
      default:
        this.parameterName = 'temperature';
        this.parameterLabel = 'temperature';
        this.parameterUnit = '°C';
    }

    this.lineChartData.datasets[0].label = `${this.parameterLabel} ${this.parameterUnit}`;
    this.updateChartData();
  });
  }

  onPeriodChange(): void {
    this.updateChartData();
  }

  onDateChange(newDate: string): void {
    this.selectedDate = newDate;
    if (this.selectedPeriod === 'day') {
      this.updateChartData();
    }
  }

  setToday(): void {
    this.selectedDate = this.today;
    if (this.selectedPeriod === 'day') {
      this.updateChartData();
    }
  }

  getUnit(param: string): string {
    switch (param) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'windSpeed': return 'm/s';
      default: return '';
    }
  }


  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  updateChartData(): void {
    if (this.selectedPeriod === 'day') {
      this.supabaseService
        .getWeatherDataByCustomRange(this.selectedDate, this.selectedDate)
        .subscribe((data) => this.processData(data ?? []));
    } else if (this.selectedPeriod === 'custom') {
      if (!this.customStartDate || !this.customEndDate) return;
      this.supabaseService
        .getWeatherDataByCustomRange(this.customStartDate, this.customEndDate)
        .subscribe((data) => this.processData(data ?? []));
    } else {
      this.supabaseService
        .getWeatherDataByPeriod(this.selectedPeriod)
        .subscribe((data) => this.processData(data ?? []));
    }
  }

  loadCustomRange(): void {
    if (!this.customStartDate || !this.customEndDate) return;
    const from = new Date(this.customStartDate);
    const to = new Date(this.customEndDate);
    if (from > to) {
      alert('Datum "Od" ne sme biti po datumu "Do".');
      return;
    }
    this.supabaseService
      .getWeatherDataByCustomRange(this.customStartDate, this.customEndDate)
      .subscribe((data) => this.processData(data ?? []));
  }

  processData(data: WeatherData[]): void {
    if (!data || data.length === 0) {
      this.lineChartData.labels = [];
      this.lineChartData.datasets[0].data = [];
      this.paramMin = null;
      this.paramMax = null;
      this.paramAvg = null;
      return;
    }

    const labels: string[] = [];
    const values: number[] = [];

    switch (this.selectedPeriod) {
      case 'day': {
        const selected = new Date(this.selectedDate);
        const dayData = data.filter((d) => {
          const date = new Date(d.created_at);
          return date.toDateString() === selected.toDateString();
        });
        dayData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        dayData.forEach((d) => {
          const date = new Date(d.created_at);
          const label = date.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
          labels.push(label);
          values.push(d[this.parameterName] ?? NaN);
        });
        break;
      }

      case 'week':
      case 'month': {
        const groupedBy6Hour = new Map<string, WeatherData[]>();
        data.forEach((d) => {
          const dt = new Date(d.created_at);
          const roundedHour = Math.floor(dt.getHours() / 6) * 6;
          const label = `${dt.toLocaleDateString('sl-SI')} ${roundedHour.toString().padStart(2, '0')}:00`;
          if (!groupedBy6Hour.has(label)) groupedBy6Hour.set(label, []);
          groupedBy6Hour.get(label)!.push(d);
        });
        const sortedLabels = Array.from(groupedBy6Hour.keys()).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        sortedLabels.forEach((label) => {
          const vals = groupedBy6Hour.get(label)!;
          const avgVal = vals.reduce((sum, curr) => sum + (curr[this.parameterName] ?? 0), 0) / vals.length;
          labels.push(label);
          values.push(+avgVal.toFixed(1));
        });
        break;
      }

      case '6months':
      case 'year': {
        const groupedByDate = new Map<string, WeatherData[]>();
        data.forEach((d) => {
          const dt = new Date(d.created_at);
          const label = dt.toLocaleDateString('sl-SI');
          if (!groupedByDate.has(label)) groupedByDate.set(label, []);
          groupedByDate.get(label)!.push(d);
        });
        const sortedDates = Array.from(groupedByDate.keys()).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        sortedDates.forEach((date) => {
          const vals = groupedByDate.get(date)!;
          const avgVal = vals.reduce((sum, curr) => sum + (curr[this.parameterName] ?? 0), 0) / vals.length;
          labels.push(date);
          values.push(+avgVal.toFixed(1));
        });
        break;
      }

      case 'custom': {
        const from = new Date(this.customStartDate);
        const to = new Date(this.customEndDate);
        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays <= 3) {
          const groupedByHour = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const label = dt.toLocaleString('sl-SI', {
              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
            });
            if (!groupedByHour.has(label)) groupedByHour.set(label, []);
            groupedByHour.get(label)!.push(d);
          });
          const sortedLabels = Array.from(groupedByHour.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          sortedLabels.forEach((label) => {
            const vals = groupedByHour.get(label)!;
            const avgVal = vals.reduce((sum, curr) => sum + (curr[this.parameterName] ?? 0), 0) / vals.length;
            labels.push(label);
            values.push(+avgVal.toFixed(1));
          });
        } else if (diffDays <= 30) {
          const groupedBy6Hours = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const roundedHour = Math.floor(dt.getHours() / 6) * 6;
            const roundedDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), roundedHour);
            const label = roundedDate.toLocaleString('sl-SI', {
              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
            });
            if (!groupedBy6Hours.has(label)) groupedBy6Hours.set(label, []);
            groupedBy6Hours.get(label)!.push(d);
          });
          const sortedLabels = Array.from(groupedBy6Hours.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          sortedLabels.forEach((label) => {
            const vals = groupedBy6Hours.get(label)!;
            const avgVal = vals.reduce((sum, curr) => sum + (curr[this.parameterName] ?? 0), 0) / vals.length;
            labels.push(label);
            values.push(+avgVal.toFixed(1));
          });
        } else {
          const groupedByDay = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const label = dt.toLocaleDateString('sl-SI');
            if (!groupedByDay.has(label)) groupedByDay.set(label, []);
            groupedByDay.get(label)!.push(d);
          });
          const sortedLabels = Array.from(groupedByDay.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          sortedLabels.forEach((label) => {
            const vals = groupedByDay.get(label)!;
            const avgVal = vals.reduce((sum, curr) => sum + (curr[this.parameterName] ?? 0), 0) / vals.length;
            labels.push(label);
            values.push(+avgVal.toFixed(1));
          });
        }
        break;
      }

      default:
        break;
    }

    // Filter NaN vrednosti (če param ni prisoten)
    const filteredValues = values.map((v) => (isNaN(v) ? null : v)).filter((v): v is number => v !== null);

    this.paramMin = filteredValues.length ? Math.min(...filteredValues) : null;
    this.paramMax = filteredValues.length ? Math.max(...filteredValues) : null;
    this.paramAvg = filteredValues.length
      ? filteredValues.reduce((sum, v) => sum + v, 0) / filteredValues.length
      : null;

    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = values;

    console.log(data)
  }
}
