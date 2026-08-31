import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { SystemConfig } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);

  getConfig(): Observable<SystemConfig> {
    return this.api.get<SystemConfig>('/settings');
  }

  updateConfig(config: Partial<SystemConfig>): Observable<SystemConfig> {
    return this.api.put<SystemConfig>('/settings', config);
  }
}
