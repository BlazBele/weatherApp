import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { WeatherData } from '../../../../interfaces/weather-data';
import { SupabaseService } from '../../../../services/api/supabase.service';
import { TimestampService } from '../../../../services/timestamp.service';

@Component({
  selector: 'app-wind-speed',
  standalone: false,
  templateUrl: './wind-speed.component.html',
  styleUrl: './wind-speed.component.scss'
})
export class WindSpeedComponent {
 public selectedDate: string = new Date().toISOString().split('T')[0];
  customStartDate: string = '';
  customEndDate: string = '';
  selectedPeriod: 'day' | 'week' | 'month' | '6months' | 'year' | 'custom' = 'day';
  public min: number | null = null;
  public max: number | null = null;
  public maxDate: string | null = null;
  public avg: number | null = null;

  today: string = new Date().toISOString().split('T')[0];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Hitrost vetra [m/s]',
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

  constructor(
    private supabaseService: SupabaseService,
    private timestampService: TimestampService
  ) {}

  ngOnInit(): void {
    this.updateChartData();
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

  updateChartData(): void {
    if (this.selectedPeriod === 'day') {
      this.supabaseService
        .getWeatherDataByCustomRange(this.selectedDate, this.selectedDate)
        .subscribe((data) => {
          this.processData(data ?? []);
        });
    } else if (this.selectedPeriod === 'custom') {
      if (!this.customStartDate || !this.customEndDate) return;
      this.supabaseService
        .getWeatherDataByCustomRange(this.customStartDate, this.customEndDate)
        .subscribe((data) => {
          this.processData(data ?? []);
        });
    } else {
      this.supabaseService
        .getWeatherDataByPeriod(this.selectedPeriod)
        .subscribe((data) => {
          this.processData(data ?? []);
        });
    }
  }

  setToday(): void {
    this.selectedDate = this.today;
    if (this.selectedPeriod === 'day') {
      this.updateChartData();
    }
  }
  
  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
  }

  processData(data: WeatherData[]): void {
    if (!data || data.length === 0) {
      this.lineChartData.labels = [];
      this.lineChartData.datasets[0].data = [];
      return;
    }

    const labels: string[] = [];
    const windSpeeds: number[] = [];

        switch (this.selectedPeriod) {
      case 'day': {
        const selected = new Date(this.selectedDate);
        const dayData = data.filter((d) => {
          const date = new Date(d.created_at);
          return date.toDateString() === selected.toDateString();
        });
        dayData.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        dayData.forEach((d) => {
          const date = new Date(d.created_at);
          const label = date.toLocaleTimeString('sl-SI', {
            hour: '2-digit',
            minute: '2-digit',
          });
          labels.push(label);
          windSpeeds.push(d.wind_speed ?? NaN);
        });
        console.log(labels);
        console.log(windSpeeds);
        break;
      }

      case 'week':
      case 'month': {
        const groupedBy6Hour = new Map<string, WeatherData[]>();
        data.forEach((d) => {
          const dt = new Date(d.created_at);
          const roundedHour = Math.floor(dt.getHours() / 6) * 6;
          const label = `${dt.toLocaleDateString('sl-SI')} ${roundedHour
            .toString()
            .padStart(2, '0')}:00`;
          if (!groupedBy6Hour.has(label)) {
            groupedBy6Hour.set(label, []);
          }
          groupedBy6Hour.get(label)!.push(d);
        });

        const sortedLabels = Array.from(groupedBy6Hour.keys()).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        sortedLabels.forEach((label) => {
          const vals = groupedBy6Hour.get(label)!;
          const avgTemp =
            vals.reduce((sum, curr) => sum + (curr.wind_speed ?? 0), 0) /
            vals.length;
          labels.push(label);
          windSpeeds.push(+avgTemp.toFixed(1));
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
          const avgTemp =
            vals.reduce((sum, curr) => sum + (curr.wind_speed ?? 0), 0) /
            vals.length;
          labels.push(date);
          windSpeeds.push(+avgTemp.toFixed(1));
        });
        break;
      }

      case 'custom': {
        const from = new Date(this.customStartDate);
        const to = new Date(this.customEndDate);
        const diffDays =
          Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) +
          1;

        if (diffDays <= 3) {
          //Združevanje po urah
          const groupedByHour = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const label = dt.toLocaleString('sl-SI', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
            });
            if (!groupedByHour.has(label)) groupedByHour.set(label, []);
            groupedByHour.get(label)!.push(d);
          });

          const sortedLabels = Array.from(groupedByHour.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );

          sortedLabels.forEach((label) => {
            const vals = groupedByHour.get(label)!;
            const avgTemp =
              vals.reduce((sum, curr) => sum + (curr.wind_speed ?? 0), 0) /
              vals.length;
            labels.push(label);
            windSpeeds.push(+avgTemp.toFixed(1));
          });
        } else if (diffDays <= 30) {
          const groupedBy6Hours = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const roundedHour = Math.floor(dt.getHours() / 6) * 6;
            const roundedDate = new Date(
              dt.getFullYear(),
              dt.getMonth(),
              dt.getDate(),
              roundedHour
            );

            const label = roundedDate.toLocaleString('sl-SI', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });

            if (!groupedBy6Hours.has(label)) groupedBy6Hours.set(label, []);
            groupedBy6Hours.get(label)!.push(d);
          });

          const sortedLabels = Array.from(groupedBy6Hours.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );

          sortedLabels.forEach((label) => {
            const vals = groupedBy6Hours.get(label)!;
            const avgTemp =
              vals.reduce((sum, curr) => sum + (curr.wind_speed ?? 0), 0) /
              vals.length;
            labels.push(label);
            windSpeeds.push(+avgTemp.toFixed(1));
          });
        } else {
          const groupedByWeek = new Map<string, WeatherData[]>();
          data.forEach((d) => {
            const dt = new Date(d.created_at);
            const year = dt.getFullYear();
            const weekNumber = this.getWeekNumber(dt);
            const label = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
            if (!groupedByWeek.has(label)) groupedByWeek.set(label, []);
            groupedByWeek.get(label)!.push(d);
          });

          const sortedWeeks = Array.from(groupedByWeek.keys()).sort((a, b) =>
            a.localeCompare(b)
          );

          sortedWeeks.forEach((week) => {
            const vals = groupedByWeek.get(week)!;
            const avgTemp =
              vals.reduce((sum, curr) => sum + (curr.wind_speed ?? 0), 0) /
              vals.length;
            labels.push(week);
            windSpeeds.push(+avgTemp.toFixed(1));
          });
        }

        break;
      }
    }
   
    //Izračun vrednosti
    const allValues = data
      .map((d) => ({
        value: d.wind_speed,
        date: d.created_at,
      }))
      .filter(
        (v) => v.value !== null && v.value !== undefined && !isNaN(v.value)
      );

    if (allValues.length > 0) {
      const values = allValues.map((v) => v.value);
      this.max = Math.max(...values);
      this.avg = values.reduce((a, b) => a + b, 0) / values.length;

      const maxEntry = allValues.find((v) => v.value === this.max);
      if (maxEntry && maxEntry.date) {
        this.maxDate = this.timestampService.formatDateString(maxEntry.date, 0);
      }
    } else {
      this.max = null;
      this.avg = null;
      this.maxDate = null;
    }

    //Trendna črta – izračunaj linearni regresijski trend
    const wind_speedDataset = {
      ...this.lineChartData.datasets[0],
      data: windSpeeds,
    };

    //Nato pripravi dataset za trendno črto
    let trendlineDataset = null;

    if (windSpeeds.length > 1) {
      const n = windSpeeds.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = windSpeeds;

      const avgX = x.reduce((a, b) => a + b, 0) / n;
      const avgY = y.reduce((a, b) => a + b, 0) / n;

      const numerator = x.reduce(
        (sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY),
        0
      );
      const denominator = x.reduce((sum, xi) => sum + (xi - avgX) ** 2, 0);
      const slope = numerator / denominator;
      const intercept = avgY - slope * avgX;

      const trendData = x.map((xi) => +(intercept + slope * xi).toFixed(2));

      trendlineDataset = {
        label: 'Trendna črta',
        data: trendData,
        borderColor: 'red',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      };
    }

    //Zdaj nastavi labels in datasets skupaj
    this.lineChartData = {
      labels,
      datasets: trendlineDataset
        ? [wind_speedDataset, trendlineDataset]
        : [wind_speedDataset],
    };
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
      .subscribe((data) => {
        this.processData(data ?? []);
      });
  }
}
