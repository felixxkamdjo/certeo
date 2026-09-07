import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDetail, ApplicationStatus } from '../../models/application.model';
import { ConfirmDialogComponent, DialogVariant } from '@shared';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly application = signal<ApplicationDetail | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly confirmDialog = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: DialogVariant;
    action: (() => void) | null;
    isLoading: boolean;
  }>({
    isOpen: false, title: '', message: '', confirmText: 'Confirmer',
    variant: 'primary', action: null, isLoading: false
  });

  readonly ApplicationStatus = ApplicationStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set('Identifiant de candidature manquant.');
      this.isLoading.set(false);
      return;
    }
    this.applicationService.getById(id).subscribe({
      next: (app) => {
        this.application.set(app);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Candidature introuvable.');
        this.isLoading.set(false);
      }
    });
  }

  getInitials(): string {
    const app = this.application();
    if (!app) return '';
    return `${app.firstName.charAt(0)}${app.lastName.charAt(0)}`.toUpperCase();
  }

  get locationLabel(): string {
    const app = this.application();
    if (!app) return '';
    return [app.city, app.country].filter(v => v).join(', ');
  }

  get cvFileName(): string {
    const app = this.application();
    if (!app?.cvUrl) return '';
    return app.cvUrl.split('/').pop() ?? 'CV';
  }

  getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: "En attente d'évaluation",
      [ApplicationStatus.InInterview]: 'En entretien',
      [ApplicationStatus.Evaluated]: 'Évalué',
      [ApplicationStatus.Selected]: 'Sélectionné',
      [ApplicationStatus.Rejected]: 'Refusé'
    };
    return labels[status];
  }

  getStatusType(status: ApplicationStatus): string {
    const types: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'pending',
      [ApplicationStatus.InInterview]: 'interview',
      [ApplicationStatus.Evaluated]: 'under-review',
      [ApplicationStatus.Selected]: 'accepted',
      [ApplicationStatus.Rejected]: 'rejected'
    };
    return types[status];
  }

  goBack(): void {
    this.router.navigate(['/admin/applications']);
  }

  onSendEmail(candidateId: string): void {
    this.router.navigate(['/admin/applications/email'], { queryParams: { candidateId } });
  }

  private confirmAndRun(title: string, message: string, confirmText: string, variant: DialogVariant, action: () => void): void {
    this.confirmDialog.set({ isOpen: true, title, message, confirmText, variant, action, isLoading: false });
  }

  onEvaluate(): void {
    const app = this.application();
    if (!app) return;
    this.confirmAndRun(
      'Marquer comme évalué',
      `Voulez-vous marquer la candidature de ${app.firstName} ${app.lastName} comme évaluée ?`,
      "Confirmer l'évaluation", 'info',
      () => this.applicationService.markEvaluated(app.id).subscribe(() => this.refreshAfterAction(ApplicationStatus.Evaluated, 'Évalué'))
    );
  }

  onInterview(): void {
    const app = this.application();
    if (!app) return;
    this.confirmAndRun(
      'Convoquer à un entretien',
      `Voulez-vous faire passer la candidature de ${app.firstName} ${app.lastName} au statut "En entretien" ?`,
      "Valider l'entretien", 'primary',
      () => this.applicationService.moveToInterview(app.id).subscribe(() => this.refreshAfterAction(ApplicationStatus.InInterview, 'En entretien'))
    );
  }

  onReject(): void {
    const app = this.application();
    if (!app) return;
    this.confirmAndRun(
      'Refuser la candidature',
      `Êtes-vous sûr de vouloir refuser la candidature de ${app.firstName} ${app.lastName} ?`,
      'Refuser le candidat', 'danger',
      () => this.applicationService.reject(app.id).subscribe(() => this.refreshAfterAction(ApplicationStatus.Rejected, 'Refusé'))
    );
  }

  onAccept(): void {
    const app = this.application();
    if (!app) return;
    this.confirmAndRun(
      'Sélectionner le candidat',
      `Confirmez-vous l'admission de ${app.firstName} ${app.lastName} pour la formation ${app.trainingTitle} ?`,
      'Confirmer la sélection', 'success',
      () => this.applicationService.select(app.id).subscribe({
        next: () => this.refreshAfterAction(ApplicationStatus.Selected, 'Sélectionné'),
        error: (err) => {
          this.confirmDialog.update(d => ({ ...d, isOpen: false, isLoading: false }));
          // Ex: 409 si capacité max atteinte
          this.successMessage.set(err?.error?.message ?? 'La sélection a échoué.');
          setTimeout(() => this.successMessage.set(null), 4000);
        }
      })
    );
  }

  private refreshAfterAction(newStatus: ApplicationStatus, label: string): void {
    this.application.update(app => app ? { ...app, status: newStatus } : null);
    this.confirmDialog.update(d => ({ ...d, isOpen: false, isLoading: false }));
    this.successMessage.set(`Statut mis à jour : ${label}`);
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  handleDialogConfirm(): void {
    this.confirmDialog.update(d => ({ ...d, isLoading: true }));
    this.confirmDialog().action?.();
  }

  handleDialogCancel(): void {
    this.confirmDialog.update(d => ({ ...d, isOpen: false, isLoading: false }));
  }
}
