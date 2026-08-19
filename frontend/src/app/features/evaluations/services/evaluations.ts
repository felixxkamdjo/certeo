import { httpResource } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Evaluation, EvaluationStatistics, EvaluationsData } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationsService {
	readonly data = httpResource<EvaluationsData>(() => '/assets/mocks/evaluations.json');
	private readonly archivedEvaluationIds = signal<ReadonlySet<string>>(new Set());

	readonly evaluations = computed<readonly Evaluation[]>(() => {
		const archivedIds = this.archivedEvaluationIds();
		return (this.data.value()?.items ?? []).filter(item => !archivedIds.has(item.id));
	});
	readonly statistics = computed<EvaluationStatistics | undefined>(() => {
		const data = this.data.value();
		if (!data) {
			return undefined;
		}

		return {
			...data.statistics,
			totalEvaluations: this.evaluations().length,
		};
	});

	findById(id: string | null): Evaluation | undefined {
		return this.evaluations().find(item => item.id === id);
	}

	archive(id: string): void {
		this.archivedEvaluationIds.update(ids => new Set(ids).add(id));
	}
}