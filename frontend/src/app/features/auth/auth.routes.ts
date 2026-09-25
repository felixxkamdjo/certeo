import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  }
] satisfies Routes;
