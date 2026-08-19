import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/quiz-list/quiz-list.component').then(m => m.QuizListComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: 'take',
    loadComponent: () => import('./pages/quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/quiz-results/quiz-results.component').then(m => m.QuizResultsComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/quiz-detail/quiz-detail.component').then(m => m.QuizDetailComponent),
  },
] satisfies Routes;
