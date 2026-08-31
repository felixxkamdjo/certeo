import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/quiz-list/quiz-list.component').then(m => m.QuizListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: ':id/take',
    loadComponent: () => import('./pages/quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
  {
    path: ':id/results',
    loadComponent: () => import('./pages/quiz-results/quiz-results.component').then(m => m.QuizResultsComponent),
  }
] satisfies Routes;
