import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableSearchComponent } from '@shared/components/table-search/table-search';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge';
import { TrainingService } from '../../services/training.service';
import { TrainingStatus } from '../../models/training.model';

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [CommonModule, RouterLink, KpiCardComponent, ConfirmDialogComponent, PaginationComponent, TableSearchComponent, StatusBadgeComponent],
  templateUrl: './training-list.component.html',
  styleUrl: './training-list.component.scss',
})
export class TrainingListComponent {
  private readonly trainingService = inject(TrainingService);

  readonly activeTab = signal<'all' | 'open' | 'closed'>('all');
  readonly searchTerm = signal('');
  readonly trainings = this.trainingService.trainings;

  readonly showConfirmModal = signal(false);
  readonly selectedTrainingId = signal<string | null>(null);

  // KPI Computations
  readonly activeTrainingsCount = computed(() =>
    this.trainings().filter((t) => t.status === TrainingStatus.Open).length
  );

  readonly totalParticipantsCount = computed(() =>
    this.trainings().reduce((acc, t) => acc + (t.acceptedCount || 0), 0)
  );

  readonly closedTrainingsCount = computed(() =>
    this.trainings().filter((t) => t.status === TrainingStatus.Closed || t.status === TrainingStatus.Archived).length
  );

  // Filtered list per active tab
  readonly filteredTrainings = computed(() => {
    const list = this.trainings();
    const tab = this.activeTab();
    const query = this.searchTerm().trim().toLowerCase();
    const matchesSearch = (training: typeof list[number]) =>
      !query || `${training.title} ${training.category} ${training.cohort}`.toLowerCase().includes(query);

    if (tab === 'open') {
      return list.filter((t) => t.status === TrainingStatus.Open && matchesSearch(t));
    }
    if (tab === 'closed') {
      return list.filter((t) => (t.status === TrainingStatus.Closed || t.status === TrainingStatus.Archived) && matchesSearch(t));
    }
    return list.filter(matchesSearch);
  });

  onSearchChange(value: string): void { this.searchTerm.set(value); }

  resetFilters(): void {
    this.searchTerm.set('');
    this.activeTab.set('all');
  }

  setTab(tab: 'all' | 'open' | 'closed'): void {
    this.activeTab.set(tab);
  }

  promptArchive(id: string): void {
    this.selectedTrainingId.set(id);
    this.showConfirmModal.set(true);
  }

  onConfirmArchive(): void {
    const id = this.selectedTrainingId();
    if (id) {
      this.trainingService.delete(id).subscribe();
    }
    this.showConfirmModal.set(false);
    this.selectedTrainingId.set(null);
  }

  onCancelArchive(): void {
    this.showConfirmModal.set(false);
    this.selectedTrainingId.set(null);
  }
}

