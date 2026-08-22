import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-qr-code-view',
  standalone: true,
  imports: [DatePipe, RouterLink, ConfirmDialogComponent],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
})
export class QrCodeViewComponent {
  private readonly doc = inject(DOCUMENT);

  readonly siteId      = signal('ODC-YDE-ACCUEIL-01');
  readonly generatedAt = signal(new Date());
  readonly showConfirm = signal(false);

  /** URL publique du formulaire visiteur encodée dans le QR */
  readonly checkInUrl = computed(() => {
    const base = this.doc.location.origin;
    return `${base}/public/presence/check-in?site=${this.siteId()}`;
  });

  /** URL image QR via qrserver.com — vrai QR scannable */
  readonly qrImageUrl = computed(() => {
    const encoded = encodeURIComponent(this.checkInUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=000000&bgcolor=ffffff&data=${encoded}`;
  });

  readonly qrImageLoaded = signal(false);
  readonly qrImageError  = signal(false);

  onQrLoaded(): void { this.qrImageLoaded.set(true);  this.qrImageError.set(false); }
  onQrError():  void { this.qrImageError.set(true);   this.qrImageLoaded.set(false); }

  downloadPng(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&color=000000&bgcolor=ffffff&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.png`);
  }

  downloadSvg(): void {
    const encoded = encodeURIComponent(this.checkInUrl());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&format=svg&data=${encoded}`;
    this.triggerLink(url, `qr-${this.siteId()}.svg`);
  }

  /**
   * Ouvre une popup dédiée contenant uniquement la fiche QR
   * stylée aux couleurs ODC, puis lance l'impression.
   * Contourne la limite du @media print scopé Angular.
   */
  print(): void {
    const qrUrl  = this.qrImageUrl();
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
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    body {
      font-family: 'Hanken Grotesk', sans-serif;
      background: #ffffff;
      width: 210mm;
      min-height: 297mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20mm;
    }

    .poster {
      width: 100%;
      max-width: 170mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8mm;
      text-align: center;
    }

    /* Bande orange supérieure */
    .poster__stripe {
      width: 100%;
      height: 6mm;
      background: #ff7900;
      border-radius: 3mm;
      margin-bottom: 2mm;
    }

    /* Logo / Marque */
    .poster__brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2mm;
    }

    .poster__brand img {
      height: 18mm;
      width: auto;
      object-fit: contain;
    }

    .poster__brand-sub {
      font-size: 9pt;
      color: #757575;
      font-weight: 400;
    }

    /* Titre */
    .poster__title {
      font-size: 22pt;
      font-weight: 800;
      color: #212121;
      line-height: 1.15;
      letter-spacing: -0.5px;
    }

    .poster__subtitle {
      font-size: 11pt;
      color: #616161;
      line-height: 1.5;
      max-width: 120mm;
    }

    /* Divider orange */
    .poster__divider {
      width: 20mm;
      height: 3px;
      background: #ff7900;
      border-radius: 2px;
    }

    /* Encadré QR */
    .poster__qr-box {
      background: #ffffff;
      border: 2.5px solid #eeeeee;
      border-radius: 5mm;
      padding: 8mm;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4mm;
    }

    .poster__qr-box img {
      display: block;
      width: 60mm;
      height: 60mm;
    }

    .poster__qr-label {
      font-size: 8pt;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    /* Instructions */
    .poster__steps {
      display: flex;
      gap: 6mm;
      width: 100%;
      justify-content: center;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2mm;
      max-width: 40mm;
    }

    .step__num {
      width: 8mm;
      height: 8mm;
      border-radius: 50%;
      background: #fff3e0;
      color: #ff7900;
      font-size: 9pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step__text {
      font-size: 8pt;
      color: #616161;
      line-height: 1.4;
      text-align: center;
    }

    /* Pied de page */
    .poster__footer {
      width: 100%;
      border-top: 1px solid #eeeeee;
      padding-top: 4mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5mm;
    }

    .poster__site-id {
      font-size: 9pt;
      font-weight: 600;
      color: #424242;
    }

    /* Bande orange inférieure */
    .poster__bottom-stripe {
      width: 100%;
      height: 3mm;
      background: linear-gradient(90deg, #ff7900 0%, #ffb27a 100%);
      border-radius: 2mm;
      margin-top: 2mm;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="poster__stripe"></div>

    <div class="poster__brand">
      <img src="${logoUrl}" alt="Logo CERTEO" />
      <span class="poster__brand-sub">Orange Digital Center</span>
    </div>

    <h1 class="poster__title">Enregistrez<br/>votre présence</h1>
    <p class="poster__subtitle">
      Scannez ce QR code avec votre téléphone pour accéder au formulaire d'enregistrement visiteur.
    </p>

    <div class="poster__divider"></div>

    <div class="poster__qr-box">
      <img src="${qrUrl}" alt="QR Code présence ODC" />
      <span class="poster__qr-label">Scannez-moi</span>
    </div>

    <div class="poster__steps">
      <div class="step">
        <span class="step__num">1</span>
        <span class="step__text">Ouvrez l'appareil photo de votre téléphone</span>
      </div>
      <div class="step">
        <span class="step__num">2</span>
        <span class="step__text">Scannez le QR code; votre position GPS est vérifiée automatiquement</span>
      </div>
      <div class="step">
        <span class="step__num">3</span>
        <span class="step__text">Remplissez le formulaire et confirmez votre présence</span>
      </div>
    </div>

    <div class="poster__footer">
      <span class="poster__site-id">${siteId}</span>
    </div>

    <div class="poster__bottom-stripe"></div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

    const popup = this.doc.defaultView?.open('', '_blank', 'width=794,height=1123,scrollbars=yes');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
    }
  }

  promptRegenerate(): void { this.showConfirm.set(true); }
  cancelRegenerate(): void  { this.showConfirm.set(false); }

  confirmRegenerate(): void {
    const token = Date.now().toString(36).toUpperCase();
    this.siteId.set(`ODC-YDE-${token}`);
    this.generatedAt.set(new Date());
    this.qrImageLoaded.set(false);
    this.qrImageError.set(false);
    this.showConfirm.set(false);
  }

  private triggerLink(url: string, filename: string): void {
    const link = this.doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  }
}
