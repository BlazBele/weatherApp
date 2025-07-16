import { Injectable } from '@angular/core';
import { createClient, LockFunc, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const noLock: LockFunc = async (key, acquireTimeout, callback) => callback();


@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  public supabaseClient: SupabaseClient;
  
  constructor() {
    this.supabaseClient = createClient(
      environment.supabaseUrl,
      environment.supabaseApiKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      lock: noLock  
    }
  }
    );
  }
}
