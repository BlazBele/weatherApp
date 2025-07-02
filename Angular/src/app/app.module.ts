import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/pages/home/home.component';
import { NavbarComponent } from './components/partials/navbar/navbar.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './components/pages/auth/login/login.component';
import { FormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { TrendIndicatorComponent } from './components/partials/trend-indicator/trend-indicator.component'


export function HttpLoaderFactory(http: HttpClient){
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    AdminDashboardComponent,
    TrendIndicatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'sl',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
