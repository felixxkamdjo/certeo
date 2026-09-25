import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { QuizResultsService } from '../../services/quiz-results';
import { QuizAnswerResult } from '../../models/quiz-results.model';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  // Pas de RouterLink — toute navigation est gérée via Router
  // pour garder le contrôle et éviter tout lien admin accidentel
  imports: [StatusBadgeComponent],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss',
})
export class QuizResultsComponent {
  private readonly router = inject(Router);
  private readonly quizResultsService = inject(QuizResultsService);

  readonly result         = computed(() => this.quizResultsService.data.value());
  readonly score          = computed(() => this.result()?.score ?? 0);
  readonly passed         = computed(() => this.result()?.passed ?? false);
  readonly answers        = computed<readonly QuizAnswerResult[]>(() => this.result()?.answers ?? []);
  readonly correctCount   = computed(() => this.result()?.correctAnswers ?? 0);
  readonly incorrectCount = computed(() => this.result()?.incorrectAnswers ?? 0);
  readonly earnedPoints   = computed(() => this.result()?.earnedPoints ?? 0);
  readonly totalPoints    = computed(() => this.result()?.totalPoints ?? 0);
  readonly certificateId  = computed(() => this.result()?.certificateId);

  /** Valeur CSS pour le conic-gradient du score circle */
  readonly scorePercent   = computed(() => `${this.score()}%`);

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  }

  /** Voir le certificat — route 100% publique */
  goToCertificate(): void {
    const id = this.certificateId();
    if (id) {
      this.router.navigate(['/public/certificates', id]);
    }
  }

  /** Repasser le quiz — route 100% publique */
  retakeQuiz(): void {
    this.router.navigate(['/public/quiz/take']);
  }
}
