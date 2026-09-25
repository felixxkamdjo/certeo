import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
  }
] satisfies Routes;
