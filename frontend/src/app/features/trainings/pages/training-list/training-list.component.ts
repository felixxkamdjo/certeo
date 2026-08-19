import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { TrainingService } from '../../services/training.service';
import { TrainingStatus } from '../../models/training.model';

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './training-list.component.html',
  styleUrl: './training-list.component.scss',
})
export class TrainingListComponent {
  private readonly trainingService = inject(TrainingService);

  readonly activeTab = signal<'all' | 'open' | 'closed'>('all');
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

    if (tab === 'open') {
      return list.filter((t) => t.status === TrainingStatus.Open);
    }
    if (tab === 'closed') {
      return list.filter((t) => t.status === TrainingStatus.Closed || t.status === TrainingStatus.Archived);
    }
    return list;
  });

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

