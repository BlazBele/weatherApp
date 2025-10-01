import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/api/supabase.service';
import { WeatherData } from '../../../interfaces/weather-data';

@Component({
  selector: 'app-edit-sql',
  standalone: false,
  templateUrl: './edit-sql.component.html',
  styleUrl: './edit-sql.component.scss'
})
export class EditSqlComponent implements OnInit {
  data: any[] = [];
  page = 0; 
  pageSize = 10;
  totalPages = 0;
  loading = false;

  sortColumn: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  isEditModalOpen = false;
  editedWeatherData: Partial<WeatherData> = {};

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadData();
  }

loadData() {
  this.loading = true;
  const fromIndex = this.page * this.pageSize;
  const toIndex = fromIndex + this.pageSize;

  //console.log(`Loading page ${this.page} with size ${this.pageSize}, range: ${fromIndex}-${toIndex}`);


  this.supabaseService
    .getWeatherDataTable(fromIndex, toIndex, this.sortColumn, this.sortDirection)
    .subscribe({
      next: (rows) => {
        this.data = rows;
        this.loading = false;
        //console.log('Loaded data:', this.data);
      },
      error: (err) => {
        //console.error('Error loading data:', err);
        this.loading = false;
      }
    });

  this.supabaseService
    .getTotalRows()
    .subscribe({
      next: (count) => {
        this.totalPages = Math.ceil(count / this.pageSize);
        //console.log('Total pages:', this.totalPages);
      },
      error: (err) => {
        //console.error('Error getting total rows:', err);
      }
    });
}

  setPage(page: number) {
    if (page < 0 || page >= this.totalPages || this.loading) return;
    this.page = page;
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.loadData();
  }

  visiblePages(): number[] {
    const maxVisible = 10;
    const pages: number[] = [];

    const start = Math.max(0, Math.min(this.page - Math.floor(maxVisible / 2), this.totalPages - maxVisible));
    const end = Math.min(this.totalPages, start + maxVisible);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
}

  pagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i);
  }

  //Odpri modal in naloži podatke za izbrani ID
  editRow(row: any) {
    this.supabaseService.getWeatherEntryById(row.id).subscribe((data) => {
      if (data) {
        this.editedWeatherData = { ...data };
        this.isEditModalOpen = true;
      }
    });
  }

  submitEdit() {
    if (!this.editedWeatherData.id) return;

    this.supabaseService.updateWeatherEntry(this.editedWeatherData.id, this.editedWeatherData).subscribe((success) => {
      if (success) {
        this.isEditModalOpen = false;
        this.loadData();
      }
    });
  }

  cancelEdit() {
    this.isEditModalOpen = false;
    this.editedWeatherData = {};
  }

  deleteRow(id: number) {
    if (confirm('Ali res želite izbrisati zapis?')) {
      this.supabaseService.deleteWeatherEntry(id).subscribe((success) => {
        if (success) {
          this.loadData();
        }
      });
    }
  }

  onPageSizeChange() {
    this.pageSize = + this.pageSize; 
    this.page = 0;
    this.loadData();
    
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadData();
  }

}

