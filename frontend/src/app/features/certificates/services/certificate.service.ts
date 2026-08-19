import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Certificate } from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly api = inject(ApiService);

  getByNumber(certNumber: string): Observable<Certificate> {
    return this.api.get<Certificate>(`/certificates/${certNumber}`);
  }

  generateCertificate(participantId: string, trainingId: string): Observable<Certificate> {
    return this.api.post<Certificate>('/certificates/generate', { participantId, trainingId });
  }

  downloadPdf(certId: string): Observable<Blob> {
    return this.api.get<Blob>(`/certificates/${certId}/pdf`);
  }
}
