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
import { TrendIndicatorComponent } from './components/partials/trend-indicator/trend-indicator.component';
import { EditSqlComponent } from './components/pages/edit-sql/edit-sql.component';
import { CompassComponent } from './components/partials/compass/compass.component';
import { AdminSidebarComponent } from './components/partials/admin-sidebar/admin-sidebar.component';

import { MachineLearningComponent } from './components/pages/machine-learning/machine-learning.component';
import { ExportComponent } from './components/pages/export/export.component';
import { TemperatureComponent } from './components/pages/detail/temperature/temperature.component';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { HumidityComponent } from './components/pages/detail/humidity/humidity.component';
import { PressureComponent } from './components/pages/detail/pressure/pressure.component';
import { WindSpeedComponent } from './components/pages/detail/wind-speed/wind-speed.component';
import { HlsVideoComponent } from './components/hls-video/hls-video.component';


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
    TrendIndicatorComponent,
    EditSqlComponent,
    CompassComponent,
    AdminSidebarComponent,
    ExportComponent,
    MachineLearningComponent,
    TemperatureComponent,
    HumidityComponent,
    PressureComponent,
    WindSpeedComponent,
    HlsVideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BaseChartDirective,
    TranslateModule.forRoot({
        defaultLanguage: 'sl',
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    })

],
  providers: [provideHttpClient(), provideCharts(withDefaultRegisterables())],
  bootstrap: [AppComponent]
})
export class AppModule { }
