import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { CandidateApplication, ApplicationStatus } from '../../models/application.model';
import { ConfirmDialogComponent, KpiCardComponent, PaginationComponent } from '@shared';

@Component({
  selector: 'app-application-list',
  standalone: true,
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

  readonly searchTerm = signal('');
  readonly statusFilter = signal<ApplicationStatus | ''>('');
  
  // Status Modal State
  readonly isStatusModalOpen = signal(false);
  readonly selectedAppForStatus = signal<CandidateApplication | null>(null);
  readonly targetStatus = signal<ApplicationStatus>(ApplicationStatus.Pending);
  readonly isStatusSaving = signal(false);

  // Delete Modal State
  readonly isDeleteModalOpen = signal(false);
  readonly selectedAppForDelete = signal<CandidateApplication | null>(null);
  readonly isDeleting = signal(false);
  
  // Pagination State
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(5);
  readonly dateFilter = signal('');

  // Mock data for development (will be replaced by API calls)
  readonly applications = signal<CandidateApplication[]>([
    {
      id: '1',
      trainingId: 'tr-1',
      trainingTitle: 'Développement Web Fullstack',
      firstName: 'Amira',
      lastName: 'Diallo',
      email: 'a.diallo@example.com',
      phone: '+221 77 123 45 67',
      status: ApplicationStatus.Pending,
      createdAt: '2023-10-12T10:00:00Z'
    },
    {
      id: '2',
      trainingId: 'tr-1',
      trainingTitle: 'Data Science & AI',
      firstName: 'Karim',
      lastName: 'Cissé',
      email: 'k.cisse@example.com',
      phone: '+221 77 234 56 78',
      status: ApplicationStatus.Accepted,
      createdAt: '2023-10-10T10:00:00Z'
    },
    {
      id: '3',
      trainingId: 'tr-2',
      trainingTitle: 'UI/UX Design',
      firstName: 'Fatou',
      lastName: 'Bâ',
      email: 'f.ba@example.com',
      phone: '+221 77 345 67 89',
      status: ApplicationStatus.Interview,
      createdAt: '2023-10-09T10:00:00Z'
    },
    {
      id: '4',
      trainingId: 'tr-1',
      trainingTitle: 'Développement Web Fullstack',
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      email: 'm.ndiaye@example.com',
      phone: '+221 77 456 78 90',
      status: ApplicationStatus.Rejected,
      createdAt: '2023-10-05T10:00:00Z'
    },
    {
      id: '5',
      trainingId: 'tr-3',
      trainingTitle: 'Cybersécurité',
      firstName: 'Aïssatou',
      lastName: 'Sow',
      email: 'a.sow@example.com',
      phone: '+221 77 567 89 01',
      status: ApplicationStatus.UnderReview,
      createdAt: '2023-10-03T10:00:00Z'
    }
  ]);

  readonly filteredApplications = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.applications().filter(app => {
      const matchesSearch = !term ||
        app.firstName.toLowerCase().includes(term) ||
        app.lastName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        (app.trainingTitle?.toLowerCase().includes(term) ?? false);
      const matchesStatus = !status || app.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  readonly kpis = computed(() => {
    const all = this.applications();
    return {
      total: all.length,
      pending: all.filter(a => a.status === ApplicationStatus.Pending || a.status === ApplicationStatus.UnderReview).length,
      accepted: all.filter(a => a.status === ApplicationStatus.Accepted).length,
      rejected: all.filter(a => a.status === ApplicationStatus.Rejected).length
    };
  });

  readonly ApplicationStatus = ApplicationStatus;

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'En attente',
      [ApplicationStatus.UnderReview]: 'En révision',
      [ApplicationStatus.Interview]: 'En entretien',
      [ApplicationStatus.Accepted]: 'Retenu',
      [ApplicationStatus.Rejected]: 'Refusé'
    };
    return labels[status];
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/admin/applications', id]);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value as ApplicationStatus | '');
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

  readonly pagedApplications = computed(() => {
    const all = this.filteredApplications();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });

  openStatusModal(app: CandidateApplication): void {
    this.selectedAppForStatus.set(app);
    this.targetStatus.set(app.status);
    this.isStatusModalOpen.set(true);
  }

  onStatusConfirm(): void {
    const app = this.selectedAppForStatus();
    const newStatus = this.targetStatus();
    if (!app) return;

    this.isStatusSaving.set(true);
    setTimeout(() => {
      this.applications.update(list =>
        list.map(item => item.id === app.id ? { ...item, status: newStatus } : item)
      );
      this.isStatusSaving.set(false);
      this.isStatusModalOpen.set(false);
      this.selectedAppForStatus.set(null);
    }, 500);
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
    setTimeout(() => {
      this.applications.update(list => list.filter(item => item.id !== app.id));
      this.isDeleting.set(false);
      this.isDeleteModalOpen.set(false);
      this.selectedAppForDelete.set(null);
    }, 500);
  }

  onDeleteCancel(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedAppForDelete.set(null);
  }
}
