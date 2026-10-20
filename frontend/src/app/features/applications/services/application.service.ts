// features/applications/services/application.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  CandidateApplication,
  ApplicationDetail,
  ApplicationStatus,
  PagedResult
} from '../models/application.model';

export interface BulkSelectRequest {
  applicationIds: string[];
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiService);

  getApplications(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: ApplicationStatus | string,
    trainingId?: string
  ): Observable<PagedResult<CandidateApplication>> {
    const params: Record<string, string | number> = {
      page,
      pageSize
    };

    const cleanSearch = search?.trim();
    if (cleanSearch && cleanSearch !== 'undefined' && cleanSearch.length > 0) {
      params['search'] = cleanSearch;
    }

    if (status && status !== 'undefined') {
      params['status'] = status;
    }

    if (trainingId && trainingId !== 'undefined' && trainingId.length > 0) {
      params['trainingId'] = trainingId;
    }

    return this.api.get<PagedResult<CandidateApplication>>('applications', params);
  }

  getAll(
    trainingId?: string,
    status?: ApplicationStatus | string,
    search?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<PagedResult<CandidateApplication>> {
    return this.getApplications(page, pageSize, search, status, trainingId);
  }

  getApplicationById(id: string): Observable<ApplicationDetail> {
    return this.api.get<ApplicationDetail>(`applications/${id}`);
  }

  getById(id: string): Observable<ApplicationDetail> {
    return this.getApplicationById(id);
  }

  submitApplication(formData: FormData): Observable<ApplicationDetail> {
    return this.api.post<ApplicationDetail>('applications', formData);
  }

  moveToInterview(id: string): Observable<void> {
    return this.api.post<void>(`applications/${id}/interview`, {});
  }

  evaluate(id: string): Observable<void> {
    return this.api.post<void>(`applications/${id}/evaluate`, {});
  }

  selectApplication(id: string): Observable<void> {
    return this.api.post<void>(`applications/${id}/select`, {});
  }

  select(id: string): Observable<void> {
    return this.selectApplication(id);
  }

  bulkSelect(applicationIds: string[]): Observable<void> {
    return this.api.post<void>('applications/bulk-select', { applicationIds });
  }

  rejectApplication(id: string): Observable<void> {
    return this.api.post<void>(`applications/${id}/reject`, {});
  }

  reject(id: string): Observable<void> {
    return this.rejectApplication(id);
  }

  sendEmail(id: string, subject: string, body: string): Observable<void> {
    return this.api.post<void>(`applications/${id}/email`, { subject, body });
  }

  sendGroupEmail(ids: string[], subject: string, body: string): Observable<void> {
    return this.api.post<void>('applications/group-email', { ids, subject, body });
  }
}
