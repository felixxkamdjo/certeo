import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { BarChartComponent, BarChartData } from '@shared/components/bar-chart/bar-chart';
import { DataTableComponent, ColumnDef, CellTemplateDirective } from '@shared/components/data-table/data-table';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, BarChartComponent, DataTableComponent, CellTemplateDirective],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent {
  readonly timeRange = signal('6 derniers mois');

  readonly tableColumns: ColumnDef[] = [
    { key: 'candidate', header: 'Candidat' },
    { key: 'training', header: 'Formation' },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Statut' },
    { key: 'action', header: 'Action', align: 'right' }
  ];

  readonly barChartData = signal<BarChartData[]>([
    { label: 'Jan', value: 400, tooltip: '400' },
    { label: 'Fév', value: 600, tooltip: '600' },
    { label: 'Mar', value: 500, tooltip: '500' },
    { label: 'Avr', value: 800, tooltip: '800' },
    { label: 'Mai', value: 900, tooltip: '900' },
    { label: 'Juin', value: 856, tooltip: '856', active: true }
  ]);

  readonly recentApplications = signal([
    {
      id: '1',
      initials: 'AS',
      name: 'Alice Smith',
      training: 'Bootcamp Développeur Full-Stack',
      date: '24 Oct 2023',
      status: 'Approuvé',
      statusClass: 'status--approved',
      avatarColor: 'primary'
    },
    {
      id: '2',
      initials: 'JD',
      name: 'John Doe',
      training: 'Fondamentaux en Data Science',
      date: '23 Oct 2023',
      status: 'En attente',
      statusClass: 'status--pending',
      avatarColor: 'secondary'
    },
    {
      id: '3',
      initials: 'MJ',
      name: 'Marie Johnson',
      training: 'UX/UI Design Masterclass',
      date: '22 Oct 2023',
      status: 'Refusé',
      statusClass: 'status--rejected',
      avatarColor: 'tertiary'
    }
  ]);
}
