import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { PresencePagedResult, AttendanceItem, QrCodeDetails, RecordAttendanceCommand } from '../models/presence.model';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private readonly api = inject(ApiService);

  // Fetch paginated attendance records with search and date filters
  getAttendances(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    date?: string,
    trainingId?: string
  ): Observable<PresencePagedResult> {
    const params: Record<string, string | number> = { page, pageSize };

    const cleanSearch = search?.trim();
    if (cleanSearch && cleanSearch.length > 0) {
      params['search'] = cleanSearch;
    }

    if (date && date.length > 0) {
      params['date'] = date;
    }

    if (trainingId && trainingId.length > 0) {
      params['trainingId'] = trainingId;
    }

    return this.api.get<PresencePagedResult>('attendances', params);
  }

  // Fetch single attendance item details by unique identifier
  getAttendanceById(id: string): Observable<AttendanceItem> {
    return this.api.get<AttendanceItem>(`attendances/${id}`);
  }

  // Retrieve current active reception center QR code
  getCenterQrCode(): Observable<QrCodeDetails> {
    return this.api.get<QrCodeDetails>('attendances/qrcode');
  }

  // Submit attendance check-in validating user geolocation coordinates
  recordAttendance(payload: RecordAttendanceCommand): Observable<AttendanceItem> {
    return this.api.post<AttendanceItem>('attendances/check-in', payload);
  }

  // Export filtered attendance records as CSV spreadsheet
  exportCsv(date?: string, trainingId?: string): Observable<Blob> {
    const params: Record<string, string> = {};
    if (date) params['date'] = date;
    if (trainingId) params['trainingId'] = trainingId;

    return this.api.get<Blob>('attendances/export', params);
  }
}
