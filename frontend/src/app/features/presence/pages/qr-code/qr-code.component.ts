import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { PresenceService } from '../../services/presence.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-qr-code-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, ConfirmDialogComponent],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
})
export class QrCodeViewComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly presenceService = inject(PresenceService);

  // Retrieve active center QR code metadata from backend
  private readonly qrCodeData$ = this.presenceService.getCenterQrCode().pipe(
    catchError(() => of({
      token: 'ODC-DOUALA-DEFAULT',
      location: 'ODC-DOUALA',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      isActive: true
    }))
  );

  private readonly qrCodeResponse = toSignal(this.qrCodeData$, {
    initialValue: {
      token: 'ODC-DOUALA',
      location: 'ODC-DOUALA',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      isActive: true
    }
  });

  readonly siteId = computed(() => this.qrCodeResponse().location || 'ODC-DOUALA');
  readonly token = computed(() => this.qrCodeResponse().token || 'ODC-DEFAULT');
  readonly generatedAt = computed(() => new Date(this.qrCodeResponse().generatedAt));
  readonly showConfirm = signal(false);

  // Compute public check-in URL embedded into QR image
  readonly checkInUrl = computed(() => {
    const origin = this.doc.location.origin;
    return `${origin}/public/presence/check-in?token=${this.token()}&site=${this.siteId()}`;
  });

  // Generate external QR image URL via qrserver API
  readonly qrImageUrl = computed(() => {
    const encoded = encodeURIComponent(this.checkInUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=000000&bgcolor=ffffff&data=${encoded}`;
  });

  readonly qrImageLoaded = signal(false);
  readonly qrImageError = signal(false);

  // Handle successful image load event
  onQrLoaded(): void {
    this.qrImageLoaded.set(true);
    this.qrImageError.set(false);
  }

  // Handle image load error event
  onQrError(): void {
    this.qrImageError.set(true);
    this.qrImageLoaded.set(false);
  }

  // Download high-resolution PNG file of reception QR code
  downloadPng(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&color=000000&bgcolor=ffffff&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.png`);
  }

  // Download vector SVG file of reception QR code
  downloadSvg(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&format=svg&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.svg`);
  }

  // Open standalone print dialog window for reception poster
  print(): void {
    const qrUrl = this.qrImageUrl();
    const siteId = this.siteId();
    const logoUrl = `${this.doc.location.origin}/assets/images/logo_certeo.png`;

    const html = `<!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="utf-8"/>
            <title>QR Code Présence — ODC</title>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&display=swap" rel="stylesheet"/>
            <style>
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4 portrait; margin: 0; }
              body { font-family: 'Hanken Grotesk', sans-serif; background: #ffffff; width: 210mm; min-height: 297mm; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
              .shape-top { position: absolute; top: 0; left: 0; width: 100%; height: 35mm; background: #ff7900; clip-path: polygon(0 0, 100% 0, 100% 10mm, 0 100%); z-index: 0; }
              .shape-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: 25mm; background: #ff7900; clip-path: polygon(0 15mm, 100% 0, 100% 100%, 0 100%); z-index: 0; }
              .poster { position: relative; z-index: 1; width: 100%; max-width: 170mm; display: flex; flex-direction: column; align-items: center; gap: 6mm; text-align: center; margin-top: 15mm; }
              .bienvenue { font-size: 20pt; color: #333; font-weight: 600; margin-bottom: 2mm; line-height: 1.2; }
              .bienvenue strong { color: #ff7900; font-weight: 800; font-size: 24pt; }
              .poster__brand { display: flex; flex-direction: column; align-items: center; gap: 2mm; }
              .poster__brand img { height: 18mm; width: auto; object-fit: contain; }
              .poster__title { font-size: 22pt; font-weight: 800; color: #212121; }
              .poster__subtitle { font-size: 11pt; color: #616161; line-height: 1.5; max-width: 120mm; }
              .poster__divider { width: 20mm; height: 3px; background: #ff7900; border-radius: 2px; }
              .poster__qr-box { border: 3.5px solid #ff7900; border-radius: 8mm; padding: 6mm; background: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.10); display: flex; flex-direction: column; align-items: center; gap: 4mm; }
              .poster__qr-box img { display: block; width: 60mm; height: 60mm; }
              .poster__steps { display: flex; gap: 6mm; width: 100%; justify-content: center; }
              .step { display: flex; flex-direction: column; align-items: center; gap: 2mm; max-width: 40mm; }
              .step__num { width: 8mm; height: 8mm; border-radius: 50%; background: #fff3e0; color: #ff7900; font-size: 9pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
              .step__text { font-size: 8pt; color: #616161; line-height: 1.4; }
              .poster__footer { width: 100%; border-top: 1px solid #eeeeee; padding-top: 4mm; display: flex; flex-direction: column; align-items: center; }
              .poster__site-id { font-size: 9pt; font-weight: 600; color: #424242; }
            </style>
          </head>
          <body>
            <div class="shape-top"></div>
            <div class="shape-bottom"></div>
            <div class="poster">
              <p class="bienvenue">Bienvenue à<br/><strong>Orange Digital Center</strong></p>
              <div class="poster__brand"><img src="${logoUrl}" alt="Logo CERTEO"/></div>
              <h1 class="poster__title">Enregistrez<br/>votre présence</h1>
              <p class="poster__subtitle">Scannez ce QR code pour accéder au formulaire d'enregistrement visiteur.</p>
              <div class="poster__divider"></div>
              <div class="poster__qr-box"><img src="${qrUrl}" alt="QR Code présence ODC"/><span style="font-size:8pt;text-transform:uppercase;color:#9e9e9e;">Scannez-moi</span></div>
              <div class="poster__steps">
                <div class="step"><span class="step__num">1</span><span class="step__text">Ouvrez l'appareil photo</span></div>
                <div class="step"><span class="step__num">2</span><span class="step__text">Scannez le QR code</span></div>
                <div class="step"><span class="step__num">3</span><span class="step__text">Confirmez votre arrivée</span></div>
              </div>
              <div class="poster__footer"><span class="poster__site-id">${siteId}</span></div>
            </div>
            <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
          </body>
          </html>`;

    const popup = this.doc.defaultView?.open('', '_blank', 'width=794,height=1123,scrollbars=yes');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    }
  }

  // Display regenerate confirmation dialog
  promptRegenerate(): void {
    this.showConfirm.set(true);
  }

  // Close regenerate confirmation dialog
  cancelRegenerate(): void {
    this.showConfirm.set(false);
  }

  // Confirm rotation of center QR code
  confirmRegenerate(): void {
    this.qrImageLoaded.set(false);
    this.qrImageError.set(false);
    this.showConfirm.set(false);
  }

  // Trigger file download via programmatic anchor click
  private triggerLink(url: string, filename: string): void {
    const link = this.doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  }
}
