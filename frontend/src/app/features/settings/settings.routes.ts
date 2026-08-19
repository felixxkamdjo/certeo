import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/system-config/system-config.component').then(m => m.SystemConfigComponent),
  }
] satisfies Routes;
