import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/api/supabase.service';
import { WeatherData } from '../../../interfaces/weather-data';

@Component({
  selector: 'app-export',
  standalone: false,
  templateUrl: './export.component.html',
})
export class ExportComponent {
  allColumns: (keyof WeatherData)[] = [
    'id', 'created_at', 'temperature', 'humidity', 'pressure0', 'pressure', 'wind_direction', 'wind_speed',
    'rain'
  ];

  sortColumn: keyof WeatherData = 'created_at';
  sortDirection: 'asc' | 'desc' = 'asc';
  exportAllRows: boolean = false;

  selectedColumns: string[] = [...this.allColumns]; 
  rowCount: number = 100; 

  constructor(private supabaseService: SupabaseService) {}

  toggleColumnManual(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked && !this.selectedColumns.includes(value)) {
      this.selectedColumns.push(value);
    } else if (!input.checked) {
      this.selectedColumns = this.selectedColumns.filter(col => col !== value);
    }
  }

exportData() {
  const limit = this.exportAllRows ? 99999 : this.rowCount;

  this.supabaseService
    .exportWeatherData(limit, this.sortColumn, this.sortDirection)
    .subscribe(data => {
      if (!data.length) {
        alert('Ni podatkov za izvoz.');
        return;
      }

      const csv = this.convertToCSV(data);
      this.downloadCSV(csv, 'vremenski_podatki.csv');
    });
}


  private convertToCSV(data: any[]): string {
    const header = this.selectedColumns.join(',');
    const rows = data.map(row =>
      this.selectedColumns.map(col => {
        const cell = row[col];
        return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  private downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  setSortColumn(column: keyof WeatherData) {
    this.sortColumn = column;
  }
}
