import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout';
import { PublicLayoutComponent } from '@layouts/public-layout/public-layout';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadChildren: () => import('@features/auth/auth.routes') },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // canActivate: [authGuard], // Disabled for easier local dev until backend is ready
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('@features/dashboard/dashboard.routes') },
      { path: 'trainings', loadChildren: () => import('@features/trainings/trainings.routes') }
      // Add other modules here as they are created
    ]
  },
  {
    path: 'public',
    component: PublicLayoutComponent,
    children: [
      // Add public routes here (presence, forms, quiz)
    ]
  },
  { path: '**', redirectTo: 'login' }
];
