import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent, PaginationComponent } from '@shared';

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
    FormsModule,
    KpiCardComponent,
    PaginationComponent
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  readonly pagedParticipants = computed(() => {
    const all = this.filteredParticipants();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return all.slice(start, start + this.itemsPerPage());
  });
}
