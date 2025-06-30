import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseApiKey);
  }

  // Prijava
async login(email: string, password: string): Promise<any> {
  const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Pridobi profil uporabnika (vključno z role številko)
  const { data: profile, error: profileError } = await this.supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw profileError;

  return {
    user: data.user,
    session: data.session,
    role: profile.role
  };
}


  // Trenutni prijavljeni uporabnik
  async getCurrentUser() {
    const { data } = await this.supabase.auth.getUser();
    return data?.user || null;
  }

  async logout() {
    await this.supabase.auth.signOut();
    localStorage.removeItem('sb-lpzcyxyceoeycxfrpyab-auth-token');
  }

  isLoggedInSync(): boolean {
    return !!localStorage.getItem('sb-lpzcyxyceoeycxfrpyab-auth-token');
  }

}
