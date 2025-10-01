import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private translate: TranslateService
  ) {}

async login() {
  try {
    const result = await this.authService.login(this.email, this.password);
    if (result.role === 1) {
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = this.translate.instant('accessDenied');
    }
  } catch (err) {
    this.errorMessage = this.translate.instant('invalidCredentials');
  }
}


}
