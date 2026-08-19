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
  @Input({ required: true }) icon: string = '';
  @Input() colorTheme: KpiColorTheme = 'primary';
}
