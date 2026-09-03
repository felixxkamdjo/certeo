// features/trainings/services/training.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  TrainingListItem,
  TrainingDetail,
  CreateTrainingRequest,
  PagedResult,
  TrainingCategory
} from '../models/training.model';

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly api = inject(ApiService);

  getTrainings(page: number = 1, pageSize: number = 20, search?: string): Observable<PagedResult<TrainingListItem>> {
    const params: Record<string, string | number> = {
      page,
      pageSize
    };

    const cleanSearch = search?.trim();
    if (cleanSearch && cleanSearch !== 'undefined' && cleanSearch.length > 0) {
      params['search'] = cleanSearch;
    }

    return this.api.get<PagedResult<TrainingListItem>>('trainings', params);
  }

  getTrainingById(idOrSlug: string): Observable<TrainingDetail> {
    return this.api.get<TrainingDetail>(`trainings/${idOrSlug}`);
  }

  getById(idOrSlug: string): Observable<TrainingDetail> {
    return this.getTrainingById(idOrSlug);
  }

  createTraining(payload: CreateTrainingRequest): Observable<TrainingDetail> {
    return this.api.post<TrainingDetail>('trainings', payload);
  }

  create(payload: CreateTrainingRequest): Observable<TrainingDetail> {
    return this.createTraining(payload);
  }

  getCategories(): Observable<TrainingCategory[]> {
    return this.api.get<TrainingCategory[]>('referencedata/categories');
  }

  deleteTraining(id: string): Observable<void> {
    return this.api.delete<void>(`trainings/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.deleteTraining(id);
  }
}
