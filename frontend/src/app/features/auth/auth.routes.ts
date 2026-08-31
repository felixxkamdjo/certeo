// auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
