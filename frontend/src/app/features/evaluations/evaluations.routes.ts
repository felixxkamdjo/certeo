import { Routes } from '@angular/router';

// Note : les routes /public/quiz/take et /public/quiz/results sont déclarées
// dans app.routes.ts sous le public-layout — elles ne font PAS partie du module admin.

export default [
  {
    path: '',
    loadComponent: () => import('./pages/quiz-list/quiz-list.component').then(m => m.QuizListComponent),
  },
  {
    path: 'send',
    loadComponent: () => import('./pages/quiz-send/quiz-send.component').then(m => m.QuizSendComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
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
