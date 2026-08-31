import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./pages/participant-list/participant-list').then(m => m.ParticipantListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/participant-profile/participant-profile.component').then(m => m.ParticipantProfileComponent),
  }
] satisfies Routes;
