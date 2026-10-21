import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/presence-list/presence-list.component').then(m => m.PresenceListComponent),
  },

  {
    path: 'qr-code',
    loadComponent: () => import('./pages/qr-code/qr-code.component').then(m => m.QrCodeViewComponent),
  },

  {
    path: 'configuration',
    loadComponent: () => import('./pages/presence-config/presence-config.component').then(m => m.PresenceConfigComponent),
  },

  {
    path: 'check-in',
    loadComponent: () => import('./pages/presence-form/presence-form.component').then(m => m.PresenceFormComponent),
  },

  { path: 'presence-config', redirectTo: 'configuration', pathMatch: 'full' }
] satisfies Routes;
