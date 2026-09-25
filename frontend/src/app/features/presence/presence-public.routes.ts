import { Routes } from '@angular/router';

export default [
  { path: '', redirectTo: 'check-in', pathMatch: 'full' },
  { path: 'check-in', loadComponent: () => import('./pages/presence-form/presence-form.component').then(m => m.PresenceFormComponent) },
] satisfies Routes;