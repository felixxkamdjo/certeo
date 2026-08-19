import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  iconType: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard', iconType: 'dashboard' },
    { label: 'Formations', route: '/admin/trainings', iconType: 'trainings' },
    { label: 'Candidatures', route: '/admin/applications', iconType: 'applications' },
    { label: 'Présences', route: '/admin/presence', iconType: 'presence' },
    { label: 'Évaluations', route: '/admin/evaluations', iconType: 'evaluations' },
    { label: 'Certificats', route: '/admin/certificates', iconType: 'certificates' },
    { label: 'Participants', route: '/admin/participants', iconType: 'participants' },
    { label: 'Reporting', route: '/admin/reporting', iconType: 'reporting' },
    { label: 'Paramètres', route: '/admin/settings', iconType: 'settings' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
