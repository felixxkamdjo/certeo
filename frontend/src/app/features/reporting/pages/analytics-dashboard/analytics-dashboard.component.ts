import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent {
  readonly timeRange = signal('Derniers 30 jours');



  // Mocked data for Top Formations table
  readonly topTrainings = signal([
    {
      id: 1,
      title: 'Bootcamp Développement Web',
      icon: 'code',
      iconClass: 'bg-primary-fixed text-primary-container',
      participants: 320,
      score: 4.8,
      completion: 92,
      completionColor: '#147a50'
    },
    {
      id: 2,
      title: 'Architecture Cloud AWS',
      icon: 'cloud',
      iconClass: 'bg-[#e8f0fe] text-[#1967d2]',
      participants: 156,
      score: 4.6,
      completion: 88,
      completionColor: '#147a50'
    },
    {
      id: 3,
      title: 'Design UI/UX Fondamentaux',
      icon: 'brush',
      iconClass: 'bg-[#fce8e6] text-[#c5221f]',
      participants: 245,
      score: 4.5,
      completion: 76,
      completionColor: '#ff7900' // primary-container
    }
  ]);

  exportReport(): void {
    console.log('Exporting report...');
    // Trigger export logic here
  }
}
