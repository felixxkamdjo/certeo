import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Participant } from '../models/participant.model';

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private readonly api = inject(ApiService);
  private readonly _participants = signal<Participant[]>([]);

  readonly participants = this._participants.asReadonly();

  getAll(trainingId?: string): Observable<Participant[]> {
    const params = trainingId ? { trainingId } : undefined;
    return this.api.get<Participant[]>('/participants', params).pipe(
      tap((data) => this._participants.set(data))
    );
  }

  getById(id: string): Observable<Participant> {
    return this.api.get<Participant>(`/participants/${id}`);
  }
}
