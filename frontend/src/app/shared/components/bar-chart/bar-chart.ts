import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarChartData {
  label: string;
  value: number;
  tooltip?: string;
  active?: boolean;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss'
})
export class BarChartComponent {
  @Input({ required: true }) data: BarChartData[] = [];
  @Input() yAxisLabels: string[] = ['100%', '75%', '50%', '25%', '0%'];
  @Input() maxValue: number = 1000;
  @Input() height: string = '256px';

  getHeightPercentage(value: number): number {
    if (!this.maxValue || this.maxValue === 0) return 0;
    const pct = (value / this.maxValue) * 100;
    return Math.min(Math.max(pct, 0), 100);
  }
}
