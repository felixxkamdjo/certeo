import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificateService, CertificateParticipant } from '../../services/certificate.service';

@Component({
  selector: 'app-certificate-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-view.component.html',
  styleUrl: './certificate-view.component.scss'
})
export class CertificateViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly certificateService = inject(CertificateService);

  readonly participant = signal<CertificateParticipant | null>(null);
  readonly isPublicView = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    // Check if we are in the public layout
    this.isPublicView.set(this.router.url.includes('/public/'));

    if (id) {
      // Find the participant by certificateId
      const p = this.certificateService.getParticipantByCertId(id);
      if (p) {
        this.participant.set(p);
      }
    }
  }

  downloadPdf(): void {
    const p = this.participant();
    if (p && p.certificatePdfUrl) {
      // In a real app, this would download the actual PDF
      window.open(p.certificatePdfUrl, '_blank');
    }
  }

  shareLinkedIn(): void {
    // Generate a sharing link
    const url = encodeURIComponent(window.location.origin + '/public/certificates/' + this.participant()?.certificateId);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }
}
