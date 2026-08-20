import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { PresenceCheckInDto, PresenceEntry, PresenceStats } from '../models/presence.model';

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private readonly api = inject(ApiService);
  private readonly _presences = signal<PresenceEntry[]>([]);

  readonly presences = this._presences.asReadonly();

  getAll(date?: string): Observable<PresenceEntry[]> {
    const params = date ? { date } : undefined;
    return this.api.get<PresenceEntry[]>('/presences', params).pipe(
      tap((data) => this._presences.set(data))
    );
  }

  registerPresence(data: PresenceCheckInDto): Observable<PresenceEntry> {
    return this.api.post<PresenceEntry>('/presences/check-in', data);
  }

  getStats(): Observable<PresenceStats> {
    return this.api.get<PresenceStats>('/presences/stats');
  }

  exportCsv(date?: string): Observable<Blob> {
    return this.api.get<Blob>('/presences/export', date ? { date } : undefined);
  }
}
