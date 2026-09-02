import { Component, computed, effect, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { QuizQuestion } from '../../models/quiz-take.model';
import { QuizTakeService } from '../../services/quiz-take';

type QuizState = 'loading' | 'ready' | 'started';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [],
  templateUrl: './quiz-take.component.html',
  styleUrl: './quiz-take.component.scss'
})
export class QuizTakeComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly quizTakeService = inject(QuizTakeService);
  private hasInitialized = false;
  private timerInterval?: ReturnType<typeof setInterval>;

  // Données du quiz
  readonly quizData     = computed(() => this.quizTakeService.data.value());
  readonly quizTitle    = computed(() => this.quizData()?.quizTitle ?? 'Evaluation');
  readonly trainingLabel= computed(() => this.quizData()?.trainingLabel ?? '');
  readonly instructions = computed(() => this.quizData()?.instructions ?? null);
  readonly questions    = computed<readonly QuizQuestion[]>(() => this.quizData()?.questions ?? []);

  // Etat global : loading → ready (consignes) → started (quiz)
  readonly quizState = signal<QuizState>('loading');

  // Navigation dans le quiz
  readonly currentIndex  = signal(0);
  readonly selectedAnswer = signal<number | null>(null);

  readonly currentQuestion = computed<QuizQuestion>(
    () => this.questions()[this.currentIndex()] ?? { title: 'Chargement...', options: [], answer: 0 }
  );

  readonly progress = computed(() => {
    const total = this.questions().length;
    return total ? Math.round(((this.currentIndex() + 1) / total) * 100) : 0;
  });

  // Timer
  readonly timeLeft     = signal(0);
  readonly timerDisplay = computed(() => {
    const s = this.timeLeft();
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  });
  readonly timerWarning = computed(() => this.timeLeft() > 0 && this.timeLeft() <= 60);

  constructor() {
    effect(() => {
      const data = this.quizData();
      if (data && !this.hasInitialized) {
        this.hasInitialized = true;
        const idx = Math.min(data.initialQuestionIndex, data.questions.length - 1);
        this.currentIndex.set(idx);
        this.timeLeft.set(data.durationSeconds);
        // Si pas de consignes → on passe directement au quiz
        this.quizState.set(data.instructions ? 'ready' : 'started');
      }
    });
  }

  /** Lance le quiz depuis l'écran de consignes */
  startQuiz(): void {
    this.quizState.set('started');
    this.startTimer();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const current = this.timeLeft();
      if (current <= 0) {
        this.stopTimer();
        this.router.navigate(['/public/quiz/results']);
      } else {
        this.timeLeft.set(current - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  selectAnswer(answer: number): void {
    this.selectedAnswer.set(answer);
  }

  previous(): void {
    this.currentIndex.update(i => Math.max(0, i - 1));
    this.selectedAnswer.set(null);
  }

  next(): void {
    const total = this.questions().length;
    if (this.currentIndex() < total - 1) {
      this.currentIndex.update(i => i + 1);
      this.selectedAnswer.set(null);
      return;
    }
    this.stopTimer();
    this.router.navigate(['/public/quiz/results']);
  }
}
