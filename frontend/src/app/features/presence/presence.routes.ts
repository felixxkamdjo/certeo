import { Routes } from '@angular/router';

// Routes d'administration de la présence.
// Note : qr-code et configuration sont désormais sous /admin/settings/
// pour une cohérence globale, mais restent accessibles depuis les liens de presence-list.
// Le formulaire visiteur (check-in) est EXCLUSIVEMENT sous /public/presence.

export default [
  {
    path: '',
    loadComponent: () => import('./pages/presence-list/presence-list.component').then(m => m.PresenceListComponent),
  },
  // Redirections pour compatibilité si un lien ancien est utilisé
  { path: 'qr-code',       redirectTo: '/admin/settings/qr-code',         pathMatch: 'full' },
  { path: 'configuration', redirectTo: '/admin/settings/presence-config',  pathMatch: 'full' },
] satisfies Routes;
