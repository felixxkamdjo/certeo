import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDetail, ApplicationStatus } from '../../models/application.model';
import { ConfirmDialogComponent, DialogVariant } from '@shared';
import { switchMap, catchError, of, Observable, map } from 'rxjs';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly ApplicationStatus = ApplicationStatus;

  // Déclencheur réactif Zoneless
  private readonly refreshTrigger = signal<number>(0);

  // Chargement réactif et normalisation des propriétés attendues par le HTML
  private readonly applicationData$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return of(null);

      return this.applicationService.getById(id).pipe(
        map((raw: any): ApplicationDetail | null => {
          if (!raw) return null;

          // Décomposition du nom complet si firstName/lastName ne sont pas retournés séparément
          let firstName = raw.firstName ?? '';
          let lastName = raw.lastName ?? '';
          if (!firstName && raw.fullName) {
            const parts = raw.fullName.trim().split(' ');
            firstName = parts[0] ?? '';
            lastName = parts.slice(1).join(' ');
          }

          // Normalisation de la localisation
          const location = raw.location ?? [raw.city, raw.country].filter(Boolean).join(', ') ?? 'Non spécifié';

          // Normalisation des documents
          const cvUrl = raw.cvUrl ?? '';
          const cvFileName = raw.cvFileName ?? (cvUrl ? cvUrl.split('/').pop() : 'CV_Candidat.pdf');

          return {
            ...raw,
            firstName,
            lastName,
            location,
            cvFileName,
            cvDate: raw.cvDate ?? raw.applicationDate ?? raw.createdAt,
            currentJob: raw.currentJob ?? raw.currentOccupation ?? 'Non renseigné',
            hasLaptop: raw.hasLaptop ?? raw.hasPersonalComputer ?? false,
            discoverySource: raw.discoverySource ?? raw.odcDiscoverySourceLabel ?? 'Orange Digital Center',
            availability: raw.availability ?? 'Immédiate',
            motivation: raw.motivation ?? raw.coverLetter ?? 'Aucune lettre de motivation transmise.',
            linkedinUrl: raw.linkedinUrl ?? raw.portfolioUrl,
            githubUrl: raw.githubUrl,
            timeline: raw.timeline ?? (raw.schoolOrUniversity ? [
              {
                title: raw.specialization || 'Formation Universitaire',
                organization: raw.schoolOrUniversity,
                period: raw.graduationYear ? `Diplôme ${raw.graduationYear}` : 'Cursus académique',
                isCurrent: true
              }
            ] : [])
          };
        }),
        catchError(err => {
          console.error('Erreur chargement détail candidature :', err);
          return of(null);
        })
      );
    })
  );

  readonly application = toSignal(this.applicationData$, { initialValue: null });
  readonly isLoading = computed(() => this.application() === null);
  readonly successMessage = signal<string | null>(null);

  // État de la boîte de dialogue de confirmation
  readonly confirmDialog = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: DialogVariant;
    targetStatus: ApplicationStatus | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    variant: 'primary',
    targetStatus: null,
    isLoading: false
  });

  getFullName(): string {
    const app = this.application();
    if (!app) return '';
    if (app.firstName || app.lastName) {
      return `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim();
    }
    return app.fullName ?? 'Candidat';
  }

  getInitials(): string {
    const app = this.application();
    if (!app) return '??';
    const first = app.firstName?.trim();
    const last = app.lastName?.trim();

    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    const full = this.getFullName();
    const parts = full.split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return full.slice(0, 2).toUpperCase();
  }

  getStatusLabel(status: ApplicationStatus | number | string | undefined | null): string {
    const s = String(status).toUpperCase();
    if (s === 'PENDING' || s === '0') return 'En attente d\'évaluation';
    if (s === 'UNDER_REVIEW' || s === '1') return 'En révision';
    if (s === 'INTERVIEW' || s === '2') return 'En entretien';
    if (s === 'ACCEPTED' || s === '3') return 'Retenu';
    if (s === 'REJECTED' || s === '4') return 'Refusé';
    return 'En attente d\'évaluation';
  }

  getStatusType(status: ApplicationStatus | number | string | undefined | null): string {
    const s = String(status).toUpperCase();
    if (s === 'PENDING' || s === '0') return 'pending';
    if (s === 'UNDER_REVIEW' || s === '1') return 'under-review';
    if (s === 'INTERVIEW' || s === '2') return 'interview';
    if (s === 'ACCEPTED' || s === '3') return 'accepted';
    if (s === 'REJECTED' || s === '4') return 'rejected';
    return 'pending';
  }

  goBack(): void {
    this.router.navigate(['/admin/applications']);
  }

  onSendEmail(candidateId: string): void {
    this.router.navigate(['/admin/applications/email'], {
      queryParams: { candidateId }
    });
  }

  onEvaluate(): void {
    const app = this.application();
    if (!app) return;
    this.confirmDialog.set({
      isOpen: true,
      title: 'Passer en révision',
      message: `Voulez-vous faire passer la candidature de ${this.getFullName()} au statut "En révision" ?`,
      confirmText: 'Confirmer l\'évaluation',
      variant: 'info',
      targetStatus: ApplicationStatus.UnderReview,
      isLoading: false
    });
  }

  onInterview(): void {
    const app = this.application();
    if (!app) return;
    this.confirmDialog.set({
      isOpen: true,
      title: 'Convoquer à un entretien',
      message: `Voulez-vous convoquer ${this.getFullName()} en entretien ?`,
      confirmText: 'Valider l\'entretien',
      variant: 'primary',
      targetStatus: ApplicationStatus.Interview,
      isLoading: false
    });
  }

  onReject(): void {
    const app = this.application();
    if (!app) return;
    this.confirmDialog.set({
      isOpen: true,
      title: 'Refuser la candidature',
      message: `Êtes-vous sûr de vouloir refuser la candidature de ${this.getFullName()} ?`,
      confirmText: 'Refuser le candidat',
      variant: 'danger',
      targetStatus: ApplicationStatus.Rejected,
      isLoading: false
    });
  }

  onAccept(): void {
    const app = this.application();
    if (!app) return;
    this.confirmDialog.set({
      isOpen: true,
      title: 'Sélectionner le candidat',
      message: `Confirmez-vous l'admission de ${this.getFullName()} pour la formation ${app.trainingTitle ?? ''} ?`,
      confirmText: 'Confirmer la sélection',
      variant: 'success',
      targetStatus: ApplicationStatus.Accepted,
      isLoading: false
    });
  }

  handleDialogConfirm(): void {
    const currentDialog = this.confirmDialog();
    const app = this.application();
    const newStatus = currentDialog.targetStatus;
    if (!newStatus || !app) return;

    this.confirmDialog.update(d => ({ ...d, isLoading: true }));

    let action$: Observable<any>;
    if (newStatus === ApplicationStatus.Accepted) {
      action$ = this.applicationService.select(app.id);
    } else if (newStatus === ApplicationStatus.Rejected) {
      action$ = this.applicationService.reject(app.id);
    } else if (newStatus === ApplicationStatus.Interview) {
      action$ = this.applicationService.moveToInterview(app.id);
    } else if (newStatus === ApplicationStatus.UnderReview) {
      action$ = this.applicationService.evaluate(app.id);
    } else {
      action$ = of(null);
    }

    action$.subscribe({
      next: () => {
        this.confirmDialog.update(d => ({ ...d, isOpen: false, isLoading: false }));
        const label = this.getStatusLabel(newStatus);
        this.successMessage.set(`Le statut de la candidature a été mis à jour avec succès : ${label}`);
        this.refreshTrigger.update(v => v + 1);

        setTimeout(() => {
          this.successMessage.set(null);
        }, 4000);
      },
      error: (err) => {
        console.error('Erreur mise à jour statut :', err);
        this.confirmDialog.update(d => ({ ...d, isLoading: false }));
      }
    });
  }

  handleDialogCancel(): void {
    this.confirmDialog.update(d => ({ ...d, isOpen: false, isLoading: false }));
  }
}
