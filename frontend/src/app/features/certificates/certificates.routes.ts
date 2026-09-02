import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/certificate-list/certificate-list.component').then(m => m.CertificateListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/certificate-view/certificate-view.component').then(m => m.CertificateViewComponent),
  }
] satisfies Routes;
