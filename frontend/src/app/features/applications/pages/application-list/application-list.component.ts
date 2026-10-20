import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../services/application.service';
import { CandidateApplication, ApplicationStatus } from '../../models/application.model';
import { ConfirmDialogComponent, KpiCardComponent, PaginationComponent } from '@shared';
import { Observable, of, switchMap, catchError, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-application-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ConfirmDialogComponent,
    KpiCardComponent,
    PaginationComponent
  ],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent {
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly ApplicationStatus = ApplicationStatus;

  // Filtres et pagination réactifs
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);
  readonly dateFilter = signal<string>('');

  // Déclencheur de rafraîchissement manuel pour les mutations (select, reject, etc.)
  private readonly refreshTrigger = signal<number>(0);

  // Flux réactif de chargement Zoneless (déclenché automatiquement dès la construction)
  private readonly applicationsData$ = combineLatest([
    toObservable(this.searchTerm),
    toObservable(this.statusFilter),
    toObservable(this.currentPage),
    toObservable(this.itemsPerPage),
    toObservable(this.refreshTrigger)
  ]).pipe(
    switchMap(([term, status, page, pageSize]) =>
      this.applicationService.getAll(
        undefined,
        status || undefined,
        term || undefined,
        page,
        pageSize
      ).pipe(
        catchError(err => {
          console.error('Erreur chargement candidatures :', err);
          return of({ items: [] as CandidateApplication[], totalCount: 0 });
        })
      )
    )
  );

  // Conversion en Signal accessible en lecture seule dans le template
  private readonly applicationsResponse = toSignal(this.applicationsData$, {
    initialValue: { items: [], totalCount: 0 }
  });

  readonly applications = computed(() => this.applicationsResponse().items ?? []);
  readonly totalItems = computed(() => this.applicationsResponse().totalCount ?? 0);

  // Status Modal State
  readonly isStatusModalOpen = signal(false);
  readonly selectedAppForStatus = signal<CandidateApplication | null>(null);
  readonly targetStatus = signal<ApplicationStatus>(ApplicationStatus.Pending);
  readonly isStatusSaving = signal(false);

  // Delete / Reject Modal State
  readonly isDeleteModalOpen = signal(false);
  readonly selectedAppForDelete = signal<CandidateApplication | null>(null);
  readonly isDeleting = signal(false);

  readonly filteredApplications = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    const date = this.dateFilter();

    return this.applications().filter(app => {
      const fullName = this.getFullName(app).toLowerCase();
      const matchesSearch = !term ||
        fullName.includes(term) ||
        (app.email?.toLowerCase().includes(term) ?? false) ||
        (app.trainingTitle?.toLowerCase().includes(term) ?? false);

      const matchesStatus = !status || String(app.status) === String(status);

      const appDate = (app.applicationDate || app.createdAt || '').slice(0, 10);
      const matchesDate = !date || appDate === date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  });

  readonly kpis = computed(() => {
    const all = this.applications();
    return {
      total: all.length,
      pending: all.filter(a => String(a.status) === '0' || a.status === ApplicationStatus.Pending).length,
      accepted: all.filter(a => String(a.status) === '1' || String(a.status) === '3' || a.status === ApplicationStatus.Accepted).length,
      rejected: all.filter(a => String(a.status) === '4' || a.status === ApplicationStatus.Rejected).length
    };
  });

  readonly pagedApplications = computed(() => {
    // return a slice of the filtered applications based on current page and items per page
    const all = this.filteredApplications();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });

  getFullName(app: CandidateApplication): string {
    if (app.fullName) return app.fullName;
    if (app.firstName || app.lastName) {
      return `${app.firstName ?? ''} ${app.lastName ?? ''}`.trim();
    }
    return 'Candidat';
  }

  getInitials(app: CandidateApplication): string {
    const name = this.getFullName(app).trim();
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getStatusLabel(status: ApplicationStatus | string | number): string {
    const s = String(status).toUpperCase();
    if (s === 'PENDING' || s === '0') return 'En attente';
    if (s === 'UNDER_REVIEW' || s === '1') return 'En révision';
    if (s === 'INTERVIEW' || s === '2') return 'En entretien';
    if (s === 'ACCEPTED' || s === '3') return 'Retenu';
    if (s === 'REJECTED' || s === '4') return 'Refusé';
    return 'En attente';
  }

  getStatusBadgeClass(status: ApplicationStatus | string | number): string {
    const s = String(status).toUpperCase();
    if (s === 'PENDING' || s === '0') return 'status-badge--pending';
    if (s === 'UNDER_REVIEW' || s === '1') return 'status-badge--under_review';
    if (s === 'INTERVIEW' || s === '2') return 'status-badge--interview';
    if (s === 'ACCEPTED' || s === '3') return 'status-badge--accepted';
    if (s === 'REJECTED' || s === '4') return 'status-badge--rejected';
    return 'status-badge--pending';
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/admin/applications', id]);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onDateChange(value: string): void {
    this.dateFilter.set(value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.dateFilter.set('');
    this.currentPage.set(1);
  }

  refresh(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  openStatusModal(app: CandidateApplication): void {
    this.selectedAppForStatus.set(app);
    this.targetStatus.set(app.status as ApplicationStatus);
    this.isStatusModalOpen.set(true);
  }

  onStatusConfirm(): void {
    const app = this.selectedAppForStatus();
    const newStatus = this.targetStatus();
    if (!app) return;

    this.isStatusSaving.set(true);
    let action$: Observable<any>;

    if (newStatus === ApplicationStatus.Accepted) {
      action$ = this.applicationService.select(app.id);
    } else if (newStatus === ApplicationStatus.Rejected) {
      action$ = this.applicationService.reject(app.id);
    } else if (newStatus === ApplicationStatus.Interview) {
      action$ = this.applicationService.moveToInterview(app.id);
    } else {
      action$ = of(null);
    }

    action$.subscribe({
      next: () => {
        this.isStatusSaving.set(false);
        this.isStatusModalOpen.set(false);
        this.selectedAppForStatus.set(null);
        this.refresh();
      },
      error: () => this.isStatusSaving.set(false)
    });
  }

  onStatusCancel(): void {
    this.isStatusModalOpen.set(false);
    this.selectedAppForStatus.set(null);
  }

  openDeleteModal(app: CandidateApplication): void {
    this.selectedAppForDelete.set(app);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirm(): void {
    const app = this.selectedAppForDelete();
    if (!app) return;

    this.isDeleting.set(true);
    this.applicationService.reject(app.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.selectedAppForDelete.set(null);
        this.refresh();
      },
      error: () => this.isDeleting.set(false)
    });
  }

  onDeleteCancel(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedAppForDelete.set(null);
  }
}
