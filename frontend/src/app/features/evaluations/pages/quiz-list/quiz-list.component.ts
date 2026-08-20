import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EvaluationsService } from '../../services/evaluations';

@Component({
	selector: 'app-quiz-list',
	standalone: true,
	imports: [FormsModule, RouterLink, ConfirmDialogComponent],
	templateUrl: './quiz-list.component.html',
	styleUrl: './quiz-list.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizListComponent {
	private readonly evaluationsService = inject(EvaluationsService);

	readonly searchTerm = signal('');
	readonly currentPage = signal(1);
	readonly pageSize = 3;

	readonly evaluations = this.evaluationsService.evaluations;
	readonly statistics = this.evaluationsService.statistics;
	readonly evaluationToArchive = signal<string | null>(null);

	readonly filteredEvaluations = computed(() => {
		const query = this.searchTerm().trim().toLocaleLowerCase();
		if (!query) {
			return this.evaluations();
		}

		return this.evaluations().filter((evaluation) =>
			`${evaluation.title} ${evaluation.trainingName}`.toLocaleLowerCase().includes(query),
		);
	});

	readonly visibleEvaluations = computed(() => {
		const start = (this.currentPage() - 1) * this.pageSize;
		return this.filteredEvaluations().slice(start, start + this.pageSize);
	});

	readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredEvaluations().length / this.pageSize)));

	updateSearchTerm(value: string): void {
		this.searchTerm.set(value);
		this.currentPage.set(1);
	}

	goToPage(page: number): void {
		this.currentPage.set(Math.min(Math.max(page, 1), this.pageCount()));
	}

	formatDate(date: string): string {
		return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
	}

	requestArchive(evaluationId: string): void {
		this.evaluationToArchive.set(evaluationId);
	}

	closeArchiveDialog(): void {
		this.evaluationToArchive.set(null);
	}

	confirmArchive(): void {
		const evaluationId = this.evaluationToArchive();
		if (!evaluationId) {
			return;
		}

		this.evaluationsService.archive(evaluationId);
		this.closeArchiveDialog();
	}

	get evaluationToArchiveTitle(): string {
		const evaluationId = this.evaluationToArchive();
		return this.evaluations().find(item => item.id === evaluationId)?.title ?? 'cette évaluation';
	}
}
