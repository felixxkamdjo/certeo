import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/training-list/training-list.component').then(m => m.TrainingListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/training-create/training-create.component').then(m => m.TrainingCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/training-detail/training-detail.component').then(m => m.TrainingDetailComponent),
  }
] satisfies Routes;
