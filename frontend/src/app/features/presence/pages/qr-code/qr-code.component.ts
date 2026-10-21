import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DOCUMENT, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared';

@Component({
  selector: 'app-qr-code-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, RouterLink, ConfirmDialogComponent],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
})
export class QrCodeViewComponent {
  private readonly doc = inject(DOCUMENT);

  // Manage reception location identifier
  readonly siteId = signal<string>('ODC-DOUALA');

  // Track generation timestamp
  readonly generatedAt = signal<Date>(new Date());

  // Control confirmation dialog visibility
  readonly showConfirm = signal<boolean>(false);

  // Compute public visitor form target url
  readonly checkInUrl = computed(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';
    return `${origin}/public/presence/check-in?site=${this.siteId()}`;
  });

  // Generate external QR image URL via qrserver
  readonly qrImageUrl = computed(() => {
    const encoded = encodeURIComponent(this.checkInUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=000000&bgcolor=ffffff&data=${encoded}`;
  });

  readonly qrImageLoaded = signal<boolean>(false);
  readonly qrImageError = signal<boolean>(false);

  // Handle successful image render event
  onQrLoaded(): void {
    this.qrImageLoaded.set(true);
    this.qrImageError.set(false);
  }

  // Handle failed image load fallback
  onQrError(): void {
    this.qrImageError.set(true);
    this.qrImageLoaded.set(false);
  }

  // Download high-resolution PNG file
  downloadPng(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&color=000000&bgcolor=ffffff&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.png`);
  }

  // Download vector SVG format file
  downloadSvg(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&format=svg&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.svg`);
  }

  // Open formatted print dialog window
  print(): void {
    window.print();
  }

  // Open regenerate confirmation modal
  promptRegenerate(): void {
    this.showConfirm.set(true);
  }

  // Dismiss regenerate confirmation modal
  cancelRegenerate(): void {
    this.showConfirm.set(false);
  }

  // Invalidate previous code and rotate site identifier
  confirmRegenerate(): void {
    const token = Date.now().toString(36).toUpperCase();
    this.siteId.set(`ODC-DLA-${token}`);
    this.generatedAt.set(new Date());
    this.qrImageLoaded.set(false);
    this.qrImageError.set(false);
    this.showConfirm.set(false);
  }

  // Trigger file download via programmatic anchor
  private triggerLink(url: string, filename: string): void {
    const link = this.doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  }
}
