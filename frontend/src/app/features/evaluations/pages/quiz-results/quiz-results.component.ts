import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { computed, inject } from '@angular/core';
import { QuizResultsService } from '../../services/quiz-results';
import { QuizAnswerResult } from '../../models/quiz-results.model';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss'
})
export class QuizResultsComponent {
  private readonly quizResultsService = inject(QuizResultsService);
  readonly result = computed(() => this.quizResultsService.data.value());
  readonly score = computed(() => this.result()?.score ?? 0);
  readonly answers = computed<readonly QuizAnswerResult[]>(() => this.result()?.answers ?? []);
  readonly correctCount = computed(() => this.answers().filter(answer => answer.correct).length);
  readonly incorrectCount = computed(() => this.answers().filter(answer => !answer.correct).length);
}
