import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge';
import { EvaluationsService } from '../../services/evaluations';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './quiz-detail.component.html',
  styleUrl: './quiz-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluationsService = inject(EvaluationsService);

  readonly evaluation = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.evaluationsService.findById(id);
  });

  readonly stats = this.evaluationsService.statistics;

  formatDate(date: string | undefined): string {
    if (!date) return 'Date inconnue';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  }
}
