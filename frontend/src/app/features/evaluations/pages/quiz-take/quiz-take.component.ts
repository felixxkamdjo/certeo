import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizQuestion } from '../../models/quiz-take.model';
import { QuizTakeService } from '../../services/quiz-take';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-take.component.html',
  styleUrl: './quiz-take.component.scss'
})
export class QuizTakeComponent {
  private readonly router = inject(Router);
  private readonly quizTakeService = inject(QuizTakeService);
  private hasInitialized = false;

  readonly questions = computed<readonly QuizQuestion[]>(() => this.quizTakeService.data.value()?.questions ?? []);
  readonly currentIndex = signal(0);
  readonly selectedAnswer = signal<number | null>(null);
  readonly currentQuestion = computed<QuizQuestion>(() => this.questions()[this.currentIndex()] ?? {
    title: 'Chargement de la question...',
    options: [],
    answer: 0,
  });
  readonly progress = computed(() => this.questions().length ? Math.round(((this.currentIndex() + 1) / this.questions().length) * 100) : 0);
  readonly duration = computed(() => this.quizTakeService.data.value()?.duration ?? '42:15');

  constructor() {
    effect(() => {
      const quizData = this.quizTakeService.data.value();
      if (quizData && !this.hasInitialized) {
        this.hasInitialized = true;
        this.currentIndex.set(Math.min(quizData.initialQuestionIndex, quizData.questions.length - 1));
        this.selectedAnswer.set(quizData.questions[quizData.initialQuestionIndex]?.answer ?? null);
      }
    });
  }

  selectAnswer(answer: number): void {
    this.selectedAnswer.set(answer);
  }

  previous(): void {
    this.currentIndex.update(index => Math.max(0, index - 1));
    this.selectedAnswer.set(null);
  }

  next(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(index => index + 1);
      this.selectedAnswer.set(null);
      return;
    }

    this.router.navigate(['/public/quiz/results']);
  }
}
