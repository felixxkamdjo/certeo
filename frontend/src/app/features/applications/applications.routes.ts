import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/application-list/application-list.component').then(m => m.ApplicationListComponent),
  },
  {
    path: 'form',
    loadComponent: () => import('./pages/application-form/application-form').then(m => m.ApplicationFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent),
  }
] satisfies Routes;
