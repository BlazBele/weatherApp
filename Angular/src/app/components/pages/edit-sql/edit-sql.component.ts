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
  pageSize = 100;
  totalPages = 0;
  loading = false;

  isEditModalOpen = false;
  editedWeatherData: Partial<WeatherData> = {};


  // Če želiš filtre, jih lahko definiraš tukaj
  // filters: { column: string; value: any }[] = [];

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.supabaseService
      .getWeatherDataTable(this.page, this.pageSize)
      .subscribe((rows) => {
        this.data = rows;
        this.loading = false;
        console.log(rows)
      });

    // Naložimo tudi število vseh vrstic (za paginacijo)
    this.supabaseService
      .getTotalRows()
      .subscribe((count) => {
        this.totalPages = Math.ceil(count / this.pageSize);
      });
  }

  setPage(page: number) {
    if (page < 0 || page >= this.totalPages || this.loading) return;
    this.page = page;
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


  // Odpri modal in naloži podatke za izbrani ID
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
      console.log("1")
      this.supabaseService.deleteWeatherEntry(id).subscribe((success) => {
        console.log("2")
        if (success) {
          console.log("3")
          this.loadData();
        }
      });
    }
  }
}

