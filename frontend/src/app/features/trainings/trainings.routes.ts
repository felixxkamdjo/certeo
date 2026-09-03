import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/training-list/training-list.component').then(m => m.TrainingListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/training-create/training-create.component').then(m => m.TrainingCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/training-detail/training-detail.component').then(m => m.TrainingDetailComponent)
  }
];

export default routes;
