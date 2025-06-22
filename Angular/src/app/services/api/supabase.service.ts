import { Injectable } from '@angular/core';
import { WeatherData } from '../../interfaces/weather-data';
import { environment } from '../../../environments/environment';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseApiKey);
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
        return data
      })
  );
}

}
