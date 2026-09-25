import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent, KpiCardComponent, PaginationComponent, TableSearchComponent, StatusBadgeComponent } from '@shared';

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  trainingTitle: string;
  presenceRate: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

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
export class ParticipantListComponent {
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly trainingFilter = signal('');

  // Pagination State
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(5);

  // Mock data for development
  readonly participants = signal<Participant[]>([
    {
      id: '1',
      firstName: 'Aminata',
      lastName: 'Diallo',
      email: 'a.diallo@example.com',
      trainingTitle: 'Dev Web Intensif',
      presenceRate: 95,
      status: 'ACTIVE'
    },
    {
      id: '2',
      firstName: 'Karim',
      lastName: 'Ndiaye',
      email: 'k.ndiaye@example.com',
      trainingTitle: 'Data Science',
      presenceRate: 82,
      status: 'PAUSED'
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Mensah',
      email: 's.mensah@example.com',
      trainingTitle: 'UI/UX Design',
      presenceRate: 100,
      status: 'COMPLETED'
    }
  ]);

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
      total: 1248, // hardcoded from mockup
      active: 892,
      completed: 356
    };
  });

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'PAUSED': 'En Pause',
      'COMPLETED': 'Terminé'
    };
    return labels[status];
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

  readonly pagedParticipants = computed(() => {
    const all = this.filteredParticipants();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });

  // Delete modal state
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
      p.trainingTitle, `${p.presenceRate}%`, this.getStatusLabel(p.status)
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

  onDeleteConfirm(): void {
    const p = this.selectedForDelete();
    if (!p) return;
    this.isDeleting.set(true);
    setTimeout(() => {
      this.participants.update(list => list.filter(item => item.id !== p.id));
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
