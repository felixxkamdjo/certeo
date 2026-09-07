// src/app/features/applications/services/application.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { ApplicationListItem, ApplicationDetail } from '../models/application.model';

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiService);
  private readonly _applications = signal<ApplicationListItem[]>([]);

  readonly applications = this._applications.asReadonly();

  // the sort is done in the backend, so we don't need to sort here
  getAll(trainingId?: string): Observable<ApplicationListItem[]> {
    const params: Record<string, string> = { pageSize: '1000' };
    if (trainingId) {
      params['trainingId'] = trainingId;
    }
    return this.api.get<PagedResult<ApplicationListItem>>('/applications', params).pipe(
      map((result) => result.items),
      tap((items) => this._applications.set(items))
    );
  }

  getById(id: string): Observable<ApplicationDetail> {
    return this.api.get<ApplicationDetail>(`/applications/${id}`);
  }

  moveToInterview(id: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/interview`, {});
  }

  markEvaluated(id: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/evaluate`, {});
  }

  select(id: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/select`, {});
  }

  reject(id: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/reject`, {});
  }

  // not endpoint /email ni /group-email yet in the backend
  sendEmail(id: string, subject: string, body: string): Observable<void> {
    return this.api.post<void>(`/applications/${id}/email`, { subject, body });
  }

  sendGroupEmail(ids: string[], subject: string, body: string): Observable<void> {
    return this.api.post<void>('/applications/group-email', { ids, subject, body });
  }
}
