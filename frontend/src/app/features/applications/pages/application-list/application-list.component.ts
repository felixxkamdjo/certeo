import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { ApplicationListItem, ApplicationStatus } from '../../models/application.model';
import { ConfirmDialogComponent, KpiCardComponent, PaginationComponent } from '@shared';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, KpiCardComponent, PaginationComponent],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss'
})
export class ApplicationListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<ApplicationStatus | ''>('');
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly isStatusModalOpen = signal(false);
  readonly selectedAppForStatus = signal<ApplicationListItem | null>(null);
  readonly isStatusSaving = signal(false);

  readonly isDeleteModalOpen = signal(false);
  readonly selectedAppForDelete = signal<ApplicationListItem | null>(null);
  readonly isDeleting = signal(false);

  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(5);
  readonly dateFilter = signal('');

  readonly applications = this.applicationService.applications;
  readonly ApplicationStatus = ApplicationStatus;

  ngOnInit(): void {
    this.applicationService.getAll().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les candidatures.');
      }
    });
  }

  readonly filteredApplications = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.applications().filter(app => {
      const matchesSearch = !term ||
        app.fullName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        (app.trainingTitle?.toLowerCase().includes(term) ?? false);
      const matchesStatus = status === '' || app.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  readonly kpis = computed(() => {
    const all = this.applications();
    return {
      total: all.length,
      pending: all.filter(a => a.status === ApplicationStatus.Pending || a.status === ApplicationStatus.InInterview).length,
      accepted: all.filter(a => a.status === ApplicationStatus.Selected).length,
      rejected: all.filter(a => a.status === ApplicationStatus.Rejected).length
    };
  });

  readonly pagedApplications = computed(() => {
    const all = this.filteredApplications();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });

  getInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'En attente',
      [ApplicationStatus.InInterview]: 'En entretien',
      [ApplicationStatus.Evaluated]: 'Évalué',
      [ApplicationStatus.Selected]: 'Sélectionné',
      [ApplicationStatus.Rejected]: 'Refusé'
    };
    return labels[status];
  }

  getStatusVariant(status: ApplicationStatus): string {
    const variants: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'warning',
      [ApplicationStatus.InInterview]: 'info',
      [ApplicationStatus.Evaluated]: 'info',
      [ApplicationStatus.Selected]: 'success',
      [ApplicationStatus.Rejected]: 'danger'
    };
    return variants[status];
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/admin/applications', id]);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value === '' ? '' : (Number(value) as ApplicationStatus));
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.dateFilter.set('');
  }

  openStatusModal(app: ApplicationListItem): void {
    this.selectedAppForStatus.set(app);
    this.isStatusModalOpen.set(true);
  }

  applyTransition(action: 'interview' | 'evaluate' | 'select' | 'reject'): void {
    const app = this.selectedAppForStatus();
    if (!app) return;

    const call =
      action === 'interview' ? this.applicationService.moveToInterview(app.id) :
      action === 'evaluate' ? this.applicationService.markEvaluated(app.id) :
      action === 'select' ? this.applicationService.select(app.id) :
      this.applicationService.reject(app.id);

    this.isStatusSaving.set(true);
    call.subscribe({
      next: () => {
        this.isStatusSaving.set(false);
        this.isStatusModalOpen.set(false);
        this.selectedAppForStatus.set(null);
        this.applicationService.getAll().subscribe();
      },
      error: () => {
        this.isStatusSaving.set(false);
      }
    });
  }

  onStatusCancel(): void {
    this.isStatusModalOpen.set(false);
    this.selectedAppForStatus.set(null);
  }

  openDeleteModal(app: ApplicationListItem): void {
    this.selectedAppForDelete.set(app);
    this.isDeleteModalOpen.set(true);
  }

  // not endpoint DELETE yet
  onDeleteConfirm(): void {
    const app = this.selectedAppForDelete();
    if (!app) return;
    this.isDeleting.set(true);
    setTimeout(() => {
      this.isDeleting.set(false);
      this.isDeleteModalOpen.set(false);
      this.selectedAppForDelete.set(null);
    }, 500);
  }

  onDeleteCancel(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedAppForDelete.set(null);
  }

  onExportCsv(): void {
    const header = ['ID', 'Nom complet', 'Email', 'Formation', 'Date', 'Statut'];
    const rows = this.filteredApplications().map(a => [
      a.id, a.fullName, a.email, a.trainingTitle, a.applicationDate, this.getStatusLabel(a.status)
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidatures_certeo.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
