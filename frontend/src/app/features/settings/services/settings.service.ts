import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@core/services/api.service';
import { SystemSettings, DEFAULT_SETTINGS } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api  = inject(ApiService);
  private readonly http = inject(HttpClient);

  /** Charge la configuration — fallback sur le mock si l'API est indisponible */
  getConfig(): Observable<SystemSettings> {
    return this.api.get<SystemSettings>('/settings').pipe(
      catchError(() => this.http.get<SystemSettings>('/assets/mocks/settings.json')),
    );
  }

  updateConfig(config: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.api.put<SystemSettings>('/settings', config).pipe(
      catchError(() => of({ ...DEFAULT_SETTINGS, ...config } as SystemSettings)),
    );
  }
}
