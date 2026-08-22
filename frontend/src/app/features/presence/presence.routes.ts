import { Routes } from '@angular/router';

// Routes d'administration de la présence.
// Le formulaire visiteur (check-in) est EXCLUSIVEMENT sous /public/presence — voir presence-public.routes.ts

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
] satisfies Routes;
