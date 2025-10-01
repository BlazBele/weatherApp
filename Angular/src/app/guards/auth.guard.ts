import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.authService.getCurrentUser();

    if (!user) {
      console.log('Not logged in. Redirecting...');
      this.router.navigate(['/login']);
      return false;
    }

    const { data: profile, error } = await this.authService.supabaseClient
      .from('profiles')
      .select('role, name, surname')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      console.warn('Could not fetch profile or no role found.');
      this.router.navigate(['/login']);
      return false;
    }
    console.log('Logged user:')
    console.log(`Role: ${profile.role}, Name: ${profile.name}, Surname: ${profile.surname}`);

    if (profile.role === 1) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
