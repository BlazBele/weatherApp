import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isDarkMode = false;
  isMenuOpen = false;

  selectedLanguage: { name: string, shortName: string, flag: string } = { 
    name: 'Slovenščina', 
    shortName: 'SL', 
    flag: 'assets/slovenia.png' 
  };

  languageMap: Record<string, { name: string; shortName: string; flag: string }> = {
    en: { name: 'English', shortName: 'EN', flag: 'assets/britain.png' },
    sl: { name: 'Slovenščina', shortName: 'SL', flag: 'assets/slovenia.png' },
  };

  constructor(
    private translateService: TranslateService, 
    public themeService: ThemeService,
    private authService: AuthService, 
    private router: Router,

  ) {}

  async ngOnInit(): Promise<void> {
    const lang = localStorage.getItem('lang') || 'sl';
    this.setLanguage(lang);
    
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  setLanguage(lang: string): void {
    const selected = this.languageMap[lang] || this.languageMap['sl'];
    this.selectedLanguage = { ...selected, shortName: selected.shortName };
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }

  selectLanguage(language: string): void {
    this.setLanguage(language.toLowerCase());
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedInSync();
  }

  async logout() {
    this.closeMenu();
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeMenu() {
    const toggler = document.querySelector('.navbar-toggler') as HTMLElement;
    const navbarCollapse = document.getElementById('navbarSupportedContent');

    if (navbarCollapse?.classList.contains('show') && toggler) {
      toggler.click();
    }

    this.isMenuOpen = false;
  }

}
