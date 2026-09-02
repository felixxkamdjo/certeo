import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableSearchComponent } from '@shared/components/table-search/table-search';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { EvaluationsService } from '../../services/evaluations';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [
    RouterLink,
    KpiCardComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    TableSearchComponent,
    EmptyStateComponent,
  ],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizListComponent {
  private readonly evaluationsService = inject(EvaluationsService);

  readonly searchTerm    = signal('');
  readonly trainingFilter = signal('');
  readonly dateFilter    = signal('');
  readonly currentPage   = signal(1);
  readonly pageSize      = 5;

  readonly evaluations = this.evaluationsService.evaluations;
  readonly statistics  = this.evaluationsService.statistics;
  readonly evaluationToArchive = signal<string | null>(null);

  // Liste dédupliquée des formations pour le filtre
  readonly trainingOptions = computed(() => {
    const seen = new Set<string>();
    return this.evaluations()
      .filter(e => { if (seen.has(e.trainingId)) return false; seen.add(e.trainingId); return true; })
      .map(e => ({ id: e.trainingId, name: e.trainingName }));
  });

  readonly filteredEvaluations = computed(() => {
    const query    = this.searchTerm().trim().toLowerCase();
    const training = this.trainingFilter();
    const date     = this.dateFilter();

    return this.evaluations().filter(e => {
      const matchSearch   = !query   || `${e.title} ${e.trainingName}`.toLowerCase().includes(query);
      const matchTraining = !training || e.trainingId === training;
      const matchDate     = !date    || e.createdAt.startsWith(date);
      return matchSearch && matchTraining && matchDate;
    });
  });

  readonly visibleEvaluations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredEvaluations().slice(start, start + this.pageSize);
  });

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredEvaluations().length / this.pageSize))
  );

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onFilterChange(filter: { key: string; value: string }): void {
    if (filter.key === 'training') { this.trainingFilter.set(filter.value); }
    if (filter.key === 'date')     { this.dateFilter.set(filter.value); }
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.trainingFilter.set('');
    this.dateFilter.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.pageCount()));
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(date));
  }

  requestArchive(id: string): void { this.evaluationToArchive.set(id); }
  closeArchiveDialog(): void       { this.evaluationToArchive.set(null); }

  confirmArchive(): void {
    const id = this.evaluationToArchive();
    if (!id) return;
    this.evaluationsService.archive(id);
    this.closeArchiveDialog();
  }

  get evaluationToArchiveTitle(): string {
    const id = this.evaluationToArchive();
    return this.evaluations().find(e => e.id === id)?.title ?? 'cette évaluation';
  }
}
