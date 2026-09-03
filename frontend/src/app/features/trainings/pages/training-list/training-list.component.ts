import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap, catchError, of } from 'rxjs';

import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableSearchComponent } from '@shared/components/table-search/table-search';
import { StatusBadgeComponent, BadgeStatus } from '@shared/components/status-badge/status-badge';

import { TrainingService } from '../../services/training.service';
import { TrainingListItem, TrainingStatus, PagedResult } from '../../models/training.model';

@Component({
  selector: 'app-training-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    KpiCardComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    TableSearchComponent,
    StatusBadgeComponent
  ],
  templateUrl: './training-list.component.html',
  styleUrl: './training-list.component.scss'
})
export class TrainingListComponent {
  private readonly trainingService = inject(TrainingService);

  // Manage UI filter states
  readonly activeTab = signal<'all' | 'open' | 'closed'>('all');
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly isLoading = signal(false);
  private readonly reloadTrigger = signal(0);

  // Synchronize query parameters into an observable stream
  private readonly queryParams$ = toObservable(
    computed(() => ({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchTerm(),
      reload: this.reloadTrigger()
    }))
  );

  // Fetch data reactively on query parameters change
  private readonly queryResult = toSignal(
    this.queryParams$.pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(({ page, pageSize, search }) =>
        this.trainingService.getTrainings(page, pageSize, search).pipe(
          tap(() => this.isLoading.set(false)),
          catchError(() => {
            this.isLoading.set(false);
            return of({
              items: [],
              totalCount: 0,
              page: 1,
              pageSize: 10,
              totalPages: 0
            } as PagedResult<TrainingListItem>);
          })
        )
      )
    ),
    {
      initialValue: {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      } as PagedResult<TrainingListItem>
    }
  );

  // Extract training items list from query result
  readonly trainings = computed(() => this.queryResult().items);

  // Extract total record count from query result
  readonly totalCount = computed(() => this.queryResult().totalCount);

  // Control archive confirmation modal state
  readonly showConfirmModal = signal(false);
  readonly selectedTrainingId = signal<string | null>(null);

  // Compute active trainings count
  readonly activeTrainingsCount = computed(() =>
    this.trainings().filter(
      (t) => t.status === TrainingStatus.Published || t.status === TrainingStatus.InProgress
    ).length
  );

  // Compute total registered participants
  readonly totalParticipantsCount = computed(() =>
    this.trainings().reduce((acc, t) => acc + (t.selectedCount || 0), 0)
  );

  // Compute closed and cancelled trainings count
  readonly closedTrainingsCount = computed(() =>
    this.trainings().filter(
      (t) => t.status === TrainingStatus.Completed || t.status === TrainingStatus.Cancelled
    ).length
  );

  // Filter trainings by active tab selection
  readonly filteredTrainings = computed(() => {
    const list = this.trainings();
    const tab = this.activeTab();

    if (tab === 'open') {
      return list.filter(
        (t) => t.status === TrainingStatus.Published || t.status === TrainingStatus.InProgress
      );
    }
    if (tab === 'closed') {
      return list.filter(
        (t) => t.status === TrainingStatus.Completed || t.status === TrainingStatus.Cancelled
      );
    }
    return list;
  });

  // Update search keyword and reset page to first
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  // Clear filters and reset page to first
  resetFilters(): void {
    this.searchTerm.set('');
    this.activeTab.set('all');
    this.currentPage.set(1);
  }

  // Switch current tab view
  setTab(tab: 'all' | 'open' | 'closed'): void {
    this.activeTab.set(tab);
  }

  // Navigate to target page
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // Open confirmation modal for archiving
  promptArchive(id: string): void {
    this.selectedTrainingId.set(id);
    this.showConfirmModal.set(true);
  }

  // Archive selected training and trigger data reload
  onConfirmArchive(): void {
    const id = this.selectedTrainingId();
    if (id) {
      this.trainingService.deleteTraining(id).subscribe({
        next: () => this.reloadTrigger.update((v) => v + 1)
      });
    }
    this.showConfirmModal.set(false);
    this.selectedTrainingId.set(null);
  }

  // Dismiss archive confirmation modal
  onCancelArchive(): void {
    this.showConfirmModal.set(false);
    this.selectedTrainingId.set(null);
  }

  // Map training status to badge configuration
  getStatusBadgeConfig(status: TrainingStatus): { label: string; variant: BadgeStatus } {
    switch (status) {
      case TrainingStatus.Published:
        return { label: 'Publiée', variant: 'success' };
      case TrainingStatus.InProgress:
        return { label: 'En cours', variant: 'info' };
      case TrainingStatus.Draft:
        return { label: 'Brouillon', variant: 'warning' };
      // case TrainingStatus.Completed:
      //   return { label: 'Clôturée', variant: 'neutral' };
      case TrainingStatus.Cancelled:
        return { label: 'Annulée', variant: 'danger' };
      default:
        return { label: 'Inconnu', variant: 'default' };
    }
  }
}
