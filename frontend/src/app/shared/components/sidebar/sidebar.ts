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
    { label: 'Formations', route: '/admin/trainings', iconType: 'school' },
    { label: 'Candidatures', route: '/admin/applications', iconType: 'assignment' },
    { label: 'Présences', route: '/admin/presence', iconType: 'how_to_reg' },
    { label: 'Évaluations', route: '/admin/evaluations', iconType: 'quiz' },
    { label: 'Certificats', route: '/admin/certificates', iconType: 'workspace_premium' },
    { label: 'Participants', route: '/admin/participants', iconType: 'group' },
    { label: 'Reporting', route: '/admin/reporting', iconType: 'bar_chart' },
    { label: 'Paramètres', route: '/admin/settings', iconType: 'settings' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
