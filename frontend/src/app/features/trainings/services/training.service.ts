import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Training, CreateTrainingDto } from '../models/training.model';

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly api = inject(ApiService);
  private readonly _trainings = signal<Training[]>([]);

  readonly trainings = this._trainings.asReadonly();

  getAll(): Observable<Training[]> {
    return this.api.get<Training[]>('/trainings').pipe(
      tap((data) => this._trainings.set(data))
    );
  }

  getById(id: string): Observable<Training> {
    return this.api.get<Training>(`/trainings/${id}`);
  }

  create(dto: CreateTrainingDto): Observable<Training> {
    return this.api.post<Training>('/trainings', dto).pipe(
      tap((created) => this._trainings.update((list) => [created, ...list]))
    );
  }

  update(id: string, dto: Partial<CreateTrainingDto>): Observable<Training> {
    return this.api.put<Training>(`/trainings/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/trainings/${id}`).pipe(
      tap(() => this._trainings.update((list) => list.filter((t) => t.id !== id)))
    );
  }
}
