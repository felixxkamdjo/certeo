import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'default';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: BadgeStatus = 'default';
  @Input({ required: true }) label: string = '';
}
