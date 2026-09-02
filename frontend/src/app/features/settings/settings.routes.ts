import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  // Config formulaire visiteur et QR Code — accessibles depuis Settings ET depuis les liens dans Présence
  {
    path: 'qr-code',
    loadComponent: () => import('../presence/pages/qr-code/qr-code.component').then(m => m.QrCodeViewComponent),
  },
  {
    path: 'presence-config',
    loadComponent: () => import('../presence/pages/presence-config/presence-config.component').then(m => m.PresenceConfigComponent),
  },
] satisfies Routes;
