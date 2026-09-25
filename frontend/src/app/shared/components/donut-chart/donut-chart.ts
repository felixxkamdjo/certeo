import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutLegendItem {
  label: string;
  value: string;
  colorClass: string; // e.g. 'primary', 'success', 'neutral'
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss'
})
export class DonutChartComponent {
  @Input({ required: true }) totalValue: string | number = 0;
  @Input() totalLabel: string = 'Total';
  @Input({ required: true }) gradient: string = '';
  @Input() legendItems: DonutLegendItem[] = [];
}
