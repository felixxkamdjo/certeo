import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Quiz, QuizResult } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly api = inject(ApiService);
  private readonly _quizzes = signal<Quiz[]>([]);

  readonly quizzes = this._quizzes.asReadonly();

  getAll(): Observable<Quiz[]> {
    return this.api.get<Quiz[]>('/evaluations').pipe(
      tap((data) => this._quizzes.set(data))
    );
  }

  getById(id: string): Observable<Quiz> {
    return this.api.get<Quiz>(`/evaluations/${id}`);
  }

  create(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.api.post<Quiz>('/evaluations', quiz);
  }

  submitAnswers(quizId: string, answers: number[]): Observable<QuizResult> {
    return this.api.post<QuizResult>(`/evaluations/${quizId}/submit`, { answers });
  }

  sendEvaluation(quizId: string, candidateIds: string[]): Observable<void> {
    return this.api.post<void>(`/evaluations/${quizId}/send`, { candidateIds });
  }
}
