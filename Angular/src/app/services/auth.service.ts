import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabaseClientService: SupabaseClientService) {}

  get supabaseClient() {
    return this.supabaseClientService.supabaseClient;
  }

  async login(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;

    //Pridobi profil uporabnika (vključno z role številko)
    const { data: profile, error: profileError } = await this.supabaseClient
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

  async getCurrentUser() {
    const { data } = await this.supabaseClient.auth.getUser();
    return data?.user || null;
  }

  async logout() {
    await this.supabaseClient.auth.signOut();
    localStorage.removeItem('sb-lpzcyxyceoeycxfrpyab-auth-token');
  }

  isLoggedInSync(): boolean {
    return !!localStorage.getItem('sb-lpzcyxyceoeycxfrpyab-auth-token');
  }

  registerBeforeUnloadListener() {
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('sb-lpzcyxyceoeycxfrpyab-auth-token');
    this.supabaseClient.auth.signOut().catch(() => {
    });
  });
}

}
