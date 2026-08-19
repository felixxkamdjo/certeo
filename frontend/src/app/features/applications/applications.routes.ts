import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/application-list/application-list.component').then(m => m.ApplicationListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent),
  }
] satisfies Routes;
