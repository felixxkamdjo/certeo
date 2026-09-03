import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'default';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {

  status = input.required<BadgeStatus>();
  label = input<string>('');

  // to calculate the class based on the status input
  readonly badgeClass = computed(() => `badge badge-${this.status()}`);
}
