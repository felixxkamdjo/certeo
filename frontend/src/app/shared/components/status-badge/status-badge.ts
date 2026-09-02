import { Component, Input } from '@angular/core';

export type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'default';

/**
 * Composant badge de statut réutilisable.
 *
 * Usage simple (statut fixe) :
 *   <app-status-badge status="success" label="Retenu" />
 *
 * Usage dynamique (classe variable BEM) :
 *   <app-status-badge [variant]="item.status | lowercase" [label]="getStatusLabel(item.status)" />
 *   → génère class="status-badge status-badge--pending" etc.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  /** Statut typé (success | warning | danger | info | default). Prioritaire sur variant. */
  @Input() status?: BadgeStatus;

  /**
   * Variant libre : accepte n'importe quelle chaîne (ex: 'pending', 'active', 'under_review').
   * Génère la classe BEM status-badge--{variant}.
   * Utilisé quand le statut vient d'une enum dynamique.
   */
  @Input() variant?: string;

  /** Texte affiché dans le badge. */
  @Input({ required: true }) label: string = '';

  get badgeVariant(): string {
    return this.status ?? this.variant ?? 'default';
  }
}
