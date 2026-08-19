import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KpiColorTheme = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss'
})
export class KpiCardComponent {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) value: string | number = '';
  @Input() icon?: string;
  @Input() colorTheme: KpiColorTheme = 'primary';
  
  // New inputs for reporting dashboard
  @Input() trend?: string; // e.g. "+3.2%" or "-1.5%"
  @Input() trendDirection?: 'up' | 'down' | 'neutral' = 'up';
  @Input() subtitle?: string; // e.g. "En cours"
}
