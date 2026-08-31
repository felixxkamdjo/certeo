import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout';
import { PublicLayoutComponent } from '@layouts/public-layout/public-layout';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  // --- Auth Layout (Connexion) ---
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES)
      }
    ]
  },

  // --- Admin Layout (Back-office ODC) ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('@features/dashboard/dashboard.routes') },
      { path: 'trainings', loadChildren: () => import('@features/trainings/trainings.routes') },
      { path: 'applications', loadChildren: () => import('@features/applications/applications.routes') },
      { path: 'presence', loadChildren: () => import('@features/presence/presence.routes') },
      { path: 'evaluations', loadChildren: () => import('@features/evaluations/evaluations.routes') },
      { path: 'certificates', loadChildren: () => import('@features/certificates/certificates.routes') },
      { path: 'participants', loadChildren: () => import('@features/participants/participants.routes') },
      { path: 'reporting', loadChildren: () => import('@features/reporting/reporting.routes') },
      { path: 'settings', loadChildren: () => import('@features/settings/settings.routes') },
    ]
  },

  // --- Public Layout ---
  {
    path: 'public',
    component: PublicLayoutComponent,
    children: [
      { path: 'presence', loadChildren: () => import('@features/presence/presence.routes') },
      {
        path: 'apply',
        loadComponent: () => import('@features/applications/pages/application-form/application-form').then(m => m.ApplicationFormComponent)
      },
      {
        path: 'apply/:trainingId',
        loadComponent: () => import('@features/applications/pages/application-form/application-form').then(m => m.ApplicationFormComponent)
      },
      { path: 'quiz', loadChildren: () => import('@features/evaluations/evaluations.routes') },
      { path: 'certificates', loadChildren: () => import('@features/certificates/certificates.routes') },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
