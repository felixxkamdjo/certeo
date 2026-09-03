import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, filter } from 'rxjs';

import { StatusBadgeComponent, BadgeStatus } from '@shared/components/status-badge/status-badge';
import { TrainingService } from '../../services/training.service';
import { TrainingDetail, TrainingMode, TrainingStatus } from '../../models/training.model';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './training-detail.component.html',
  styleUrl: './training-detail.component.scss',
})
export class TrainingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly trainingService = inject(TrainingService);

  // Track link copy feedback state
  readonly copied = signal(false);

  // Extract training identifier from route parameters
  private readonly trainingId$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => Boolean(id))
  );

  // Fetch training record reactively as a signal
  readonly training = toSignal(
    this.trainingId$.pipe(
      switchMap((id) => this.trainingService.getById(id))
    )
  );

  // Supply fallback mock applicants before API integration
  private readonly applicants = [
    { name: 'Alice Dupont', email: 'alice.dupont@email.com', date: '01 Sept 2024', status: 'Confirmé' },
    { name: 'Marc Lemaire', email: 'm.lemaire@email.com', date: '02 Sept 2024', status: 'Confirmé' },
    { name: 'Sarah Connor', email: 's.connor@email.com', date: '03 Sept 2024', status: 'En attente' },
  ];

  readonly mockApplicants = signal(this.applicants);

  // Compute descriptive label for session delivery mode
  readonly modeLabel = computed(() => {
    const item = this.training();
    if (!item) return '';

    switch (item.mode) {
      case TrainingMode.InPerson:
        return 'Physique (ODC)';
      case TrainingMode.Online:
        return 'En ligne';
      case TrainingMode.Hybrid:
        return 'Hybride';
      default:
        return 'Non spécifié';
    }
  });

  // Build full public application link using training slug
  readonly publicApplyUrl = computed(() => {
    const item = this.training();
    if (!item?.slug) return '';
    return `${window.location.origin}/apply/${item.slug}`;
  });

  // Map training status to badge configuration
  readonly statusConfig = computed<{ label: string; variant: BadgeStatus }>(() => {
    const item = this.training();
    if (!item) return { label: 'Inconnu', variant: 'default' };

    switch (item.status) {
      case TrainingStatus.Published:
        return { label: 'Publiée', variant: 'success' };
      case TrainingStatus.InProgress:
        return { label: 'En cours', variant: 'info' };
      case TrainingStatus.Draft:
        return { label: 'Brouillon', variant: 'warning' };
      case TrainingStatus.Completed:
        return { label: 'Clôturée', variant: 'default' };
      case TrainingStatus.Cancelled:
        return { label: 'Annulée', variant: 'danger' };
      default:
        return { label: 'Inconnu', variant: 'default' };
    }
  });

  // Copy application URL to clipboard with temporary feedback
  copyLink(): void {
    const link = this.publicApplyUrl();
    if (!link) return;

    navigator.clipboard.writeText(link);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
