import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { AnalyticsKpi, TrainingAnalytics } from '../models/reporting.model';

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private readonly api = inject(ApiService);

  getGlobalKpis(): Observable<AnalyticsKpi> {
    return this.api.get<AnalyticsKpi>('/reporting/kpis');
  }

  getTrainingAnalytics(trainingId?: string): Observable<TrainingAnalytics[]> {
    return this.api.get<TrainingAnalytics[]>('/reporting/trainings', trainingId ? { trainingId } : undefined);
  }
}
