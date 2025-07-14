import { Injectable } from '@angular/core';
import { WeatherData } from '../../interfaces/weather-data';
import { environment } from '../../../environments/environment';
import { from, Observable, of } from 'rxjs';
import { SupabaseClientService } from '../supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  constructor(private supabaseClientService: SupabaseClientService) {}

  get supabase() {
    return this.supabaseClientService.supabaseClient;
  }

  getWeatherData(): Observable<WeatherData | null> {
    return from(
      this.supabase
        .from('VremenskiPodatki')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Supabase error:', error.message);
            return null;
          }
          console.log(data);
          return data
        })
    );
  }

  getDailyWeatherSummary(): Observable<WeatherData | null> {
      if (environment.useMock) {

    const mockData: WeatherData = {
      created_at: "00/00/2025 00:00:00",
      daily_max_humidity: 84,
      daily_max_pressure0: 1019.7,
      daily_max_temperature: 42.9,
      daily_max_wind_speed: 2.5,
      daily_min_humidity: 17,
      daily_min_pressure0: 1014,
      daily_min_temperature: 12.5,
      daily_min_wind_speed: 0,
      humidity: 41,
      pressure0: 1015.2,
      previous_humidity: 30,
      previous_pressure0: 1014.6,
      previous_temperature: 35.5,
      previous_wind_direction: "Z",
      previous_wind_speed: 0,
      temperature: 30.1,
      wind_direction: "Z",
      wind_speed: 0,
      timestamp: '',
      rain: false,
      id: 1
    };

    return of(mockData);
  }
    return from(
      this.supabase
        .from('latest_and_previous_weather')
        .select('*')
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Supabase error:', error.message);
            return null;
          }
          console.log(data);
          return data;

        })
    );
  }

  getTotalRows(): Observable<number> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .select('*', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (error) {
          console.error('Supabase count error:', error.message);
          return 0;
        }
        return count ?? 0;
      })
  );
}

getWeatherDataTable(
  fromIndex: number,
  toIndex: number,
  sortColumn: string = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): Observable<any[]> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .select('*')
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(fromIndex, toIndex)
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase fetch error:', error.message);
          throw error;
        }
        return data ?? [];
      })
  );
}





exportWeatherData(
  limit: number = 100,
  sortColumn: string = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
): Observable<any[]> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .select('*')
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .limit(limit)
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase error:', error.message);
          return [];
        }
        return data ?? [];
      })
  );
}



deleteWeatherEntry(id: number): Observable<boolean> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Napaka pri brisanju:', error.message);
          return false;
        }
        return true;
      })
  );
}


getWeatherEntryById(id: number): Observable<WeatherData | null> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Napaka pri pridobivanju podatka:', error.message);
          return null;
        }
        return data;
      })
  );
}


updateWeatherEntry(id: number, updatedData: Partial<WeatherData>): Observable<boolean> {
  return from(
    this.supabase
      .from('VremenskiPodatki')
      .update(updatedData)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Napaka pri posodabljanju:', error.message);
          return false;
        }
        return true;
      })
  );
}



}
