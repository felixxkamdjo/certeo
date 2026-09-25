import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { CandidateApplication, ApplicationStatus } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiService);
  private readonly _applications = signal<CandidateApplication[]>([]);

  readonly applications = this._applications.asReadonly();

  getAll(trainingId?: string): Observable<CandidateApplication[]> {
    const params = trainingId ? { trainingId } : undefined;
    return this.api.get<CandidateApplication[]>('/applications', params).pipe(
      tap((data) => this._applications.set(data))
    );
  }

  getById(id: string): Observable<CandidateApplication> {
    return this.api.get<CandidateApplication>(`/applications/${id}`);
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<CandidateApplication> {
    return this.api.patch<CandidateApplication>(`/applications/${id}/status`, { status });
  }

  sendEmail(id: string, subject: string, body: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/email`, { subject, body });
  }

  sendGroupEmail(ids: string[], subject: string, body: string): Observable<void> {
    return this.api.post<void>('/applications/group-email', { ids, subject, body });
  }
}
