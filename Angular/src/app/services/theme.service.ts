import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.currentTheme.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : 'light';
    this.setTheme(initialTheme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme.value === 'dark' ? 'light' : 'dark');
  }

  private setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.next(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  isDarkMode(): boolean {
    return this.currentTheme.value === 'dark';
  }
}