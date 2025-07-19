import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './components/pages/auth/login/login.component';
import { EditSqlComponent } from './components/pages/edit-sql/edit-sql.component';
import { MachineLearningComponent } from './components/pages/machine-learning/machine-learning.component';
import { ExportComponent } from './components/pages/export/export.component';
import { TemperatureComponent } from './components/pages/detail/temperature/temperature.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'export', component: ExportComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'sql', component: EditSqlComponent, canActivate: [AuthGuard]},
  { path: 'machineLearning', component: MachineLearningComponent, canActivate: [AuthGuard]},
  { path: 'temperature', component: TemperatureComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
