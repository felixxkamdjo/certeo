import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { BarChartComponent, BarChartData } from '@shared/components/bar-chart/bar-chart';
import { DonutChartComponent, DonutLegendItem } from '@shared/components/donut-chart/donut-chart';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, BarChartComponent, DonutChartComponent],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent {
  readonly timeRange = signal('Derniers 30 jours');

  readonly barChartData = signal<BarChartData[]>([
    { label: 'Jan', value: 400, tooltip: '400 inscrits' },
    { label: 'Fév', value: 550, tooltip: '550 inscrits' },
    { label: 'Mar', value: 750, tooltip: '750 inscrits' },
    { label: 'Avr', value: 600, tooltip: '600 inscrits' },
    { label: 'Mai', value: 900, tooltip: '900 inscrits', active: true },
    { label: 'Juin', value: 850, tooltip: '850 inscrits' }
  ]);

  readonly donutLegendItems = signal<DonutLegendItem[]>([
    { label: 'Terminée', value: '55%', colorClass: 'primary' },
    { label: 'En cours', value: '30%', colorClass: 'success' },
    { label: 'Planifiée', value: '15%', colorClass: 'neutral' }
  ]);



  exportReport(): void {
    console.log('Exporting report...');
    // Trigger export logic here
  }
}
