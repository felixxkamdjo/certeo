import { Routes } from '@angular/router';

// Routes publiques du module evaluations — accessibles sans authentification.
// Utilisees sous le public-layout via /public/quiz/...
// Les routes d'administration (list, create, send, detail) restent dans evaluations.routes.ts

export default [
  {
    path: 'take',
    loadComponent: () =>
      import('./pages/quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./pages/quiz-results/quiz-results.component').then(m => m.QuizResultsComponent),
  },
  // Redirection par defaut
  { path: '', redirectTo: 'take', pathMatch: 'full' },
] satisfies Routes;
