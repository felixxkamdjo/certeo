import { Routes } from '@angular/router';

export default [
  {
    path: ':number',
    loadComponent: () => import('./pages/certificate-view/certificate-view.component').then(m => m.CertificateViewComponent),
  }
] satisfies Routes;
