import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent, KpiCardComponent, PaginationComponent, StatusBadgeComponent } from '@shared';
import { TableSearchComponent } from '@shared/components';
import { ParticipantService } from '../../services/participant.service';
import { Participant, ParticipantStatus } from '../../models/participant.model';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ConfirmDialogComponent,
    KpiCardComponent,
    PaginationComponent,
    TableSearchComponent,
    StatusBadgeComponent
  ],
  templateUrl: './participant-list.html',
  styleUrl: './participant-list.scss'
})
export class ParticipantListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly participantService = inject(ParticipantService);

  readonly searchTerm = signal('');
  readonly trainingFilter = signal('');
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(5);

  readonly participants = this.participantService.participants;

  ngOnInit(): void {
    this.participantService.getAll().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Impossible de charger les participants.');
      }
    });
  }

  // filter options for the training filter dropdown, derived from the participants list
  readonly trainingOptions = computed(() => {
    const titles = new Set(
      this.participants().map(p => p.trainingTitle).filter((t): t is string => !!t)
    );
    return Array.from(titles).map(title => ({ value: title, label: title }));
  });

  readonly filteredParticipants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const training = this.trainingFilter();
    return this.participants().filter(p => {
      const matchesSearch = !term ||
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term);
      const matchesTraining = !training || p.trainingTitle === training;
      return matchesSearch && matchesTraining;
    });
  });

  readonly kpis = computed(() => {
    const all = this.participants();
    return {
      total: all.length,
      active: all.filter(p => p.status === ParticipantStatus.ACTIVE).length,
      completed: all.filter(p => p.status === ParticipantStatus.COMPLETED).length
    };
  });

  readonly pagedParticipants = computed(() => {
    const all = this.filteredParticipants();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getStatusLabel(status: ParticipantStatus): string {
    const labels: Record<ParticipantStatus, string> = {
      [ParticipantStatus.ACTIVE]: 'Actif',
      [ParticipantStatus.ON_HOLD]: 'En Pause',
      [ParticipantStatus.COMPLETED]: 'Terminé'
    };
    return labels[status];
  }

  getStatusVariant(status: ParticipantStatus): string {
    const variants: Record<ParticipantStatus, string> = {
      [ParticipantStatus.ACTIVE]: 'success',
      [ParticipantStatus.ON_HOLD]: 'warning',
      [ParticipantStatus.COMPLETED]: 'neutral'
    };
    return variants[status];
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/admin/participants', id]);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onTrainingChange(value: string): void {
    this.trainingFilter.set(value);
    this.currentPage.set(1);
  }

  onFilterChange(filter: { key: string; value: string }): void {
    if (filter.key === 'training') {
      this.onTrainingChange(filter.value);
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  readonly isDeleteModalOpen = signal(false);
  readonly selectedForDelete = signal<Participant | null>(null);
  readonly isDeleting = signal(false);

  onEvaluate(): void {
    this.router.navigate(['/admin/evaluations']);
  }

  onExportCsv(): void {
    const header = ['ID', 'Prénom', 'Nom', 'Email', 'Formation', 'Taux de présence', 'Statut'];
    const rows = this.filteredParticipants().map(p => [
      p.id, p.firstName, p.lastName, p.email,
      p.trainingTitle ?? '', `${p.attendanceRate}%`, this.getStatusLabel(p.status)
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants_certeo.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  openDeleteModal(p: Participant): void {
    this.selectedForDelete.set(p);
    this.isDeleteModalOpen.set(true);
  }

  // not endpoint DELETE /api/participants/{id} yet
  onDeleteConfirm(): void {
    const p = this.selectedForDelete();
    if (!p) return;
    this.isDeleting.set(true);
    setTimeout(() => {
      this.isDeleting.set(false);
      this.isDeleteModalOpen.set(false);
      this.selectedForDelete.set(null);
    }, 500);
  }

  onDeleteCancel(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedForDelete.set(null);
  }
}
