import { Component, inject, signal, computed, OnInit, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CertificateService, CertificateParticipant } from '../../services/certificate.service';

/** Minimal pdf.js types for our usage */
declare const pdfjsLib: {
  getDocument(src: string | { url: string }): { promise: Promise<PdfDocument> };
  GlobalWorkerOptions: { workerSrc: string };
};

interface PdfDocument {
  numPages: number;
  getPage(num: number): Promise<PdfPage>;
}

interface PdfPage {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> };
}

@Component({
  selector: 'app-certificate-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-view.component.html',
  styleUrl: './certificate-view.component.scss'
})
export class CertificateViewComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly certificateService = inject(CertificateService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly participant = signal<CertificateParticipant | null>(null);
  readonly isPublicView = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly zoom = signal(1.5);

  private pdfDoc: PdfDocument | null = null;
  private readonly pdfCanvasContainer = viewChild<ElementRef<HTMLDivElement>>('pdfContainer');

  /** Raw PDF path for download */
  readonly pdfPath = computed(() => {
    const p = this.participant();
    return p?.certificatePdfUrl || '/assets/certificates/Jean Dupont ODC.pdf';
  });

  /** Sanitized PDF URL for fallback iframe */
  readonly pdfUrl = computed<SafeResourceUrl>(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfPath());
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isPublicView.set(this.router.url.includes('/public/'));

    if (id) {
      const p = this.certificateService.getParticipantByCertId(id);
      if (p) {
        this.participant.set(p);
      }
    }
  }

  ngAfterViewInit(): void {
    this.loadPdfJs();
  }

  /** Dynamically load pdf.js from CDN and render the PDF */
  private loadPdfJs(): void {
    // Check if already loaded
    if (typeof pdfjsLib !== 'undefined') {
      this.initPdf();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
    script.type = 'module';

    // For module scripts, we use a different approach
    const inlineScript = document.createElement('script');
    inlineScript.type = 'module';
    inlineScript.textContent = `
      import * as pdfjsModule from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
      window.pdfjsLib = pdfjsModule;
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
      window.dispatchEvent(new Event('pdfjsReady'));
    `;

    window.addEventListener('pdfjsReady', () => {
      this.initPdf();
    }, { once: true });

    document.head.appendChild(inlineScript);
  }

  private async initPdf(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.hasError.set(false);
      const loadingTask = pdfjsLib.getDocument(this.pdfPath());
      this.pdfDoc = await loadingTask.promise;
      this.totalPages.set(this.pdfDoc.numPages);
      await this.renderPage(1);
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  private async renderPage(pageNum: number): Promise<void> {
    if (!this.pdfDoc) return;

    try {
      this.isLoading.set(true);
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.zoom() });

      const container = this.pdfCanvasContainer()?.nativeElement;
      if (!container) return;

      // Clear previous renders
      container.innerHTML = '';

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      canvas.style.borderRadius = '4px';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport }).promise;
      this.currentPage.set(pageNum);
      this.isLoading.set(false);
    } catch {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.renderPage(page);
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  zoomIn(): void {
    this.zoom.update(z => Math.min(z + 0.25, 3));
    this.renderPage(this.currentPage());
  }

  zoomOut(): void {
    this.zoom.update(z => Math.max(z - 0.25, 0.5));
    this.renderPage(this.currentPage());
  }

  downloadPdf(): void {
    const url = this.pdfPath();
    const link = document.createElement('a');
    link.href = url;
    
    // Extract original filename from the URL path
    const originalFileName = url.split('/').pop() || `certificat-${this.participant()?.certificateId || 'document'}.pdf`;
    
    link.download = decodeURIComponent(originalFileName);
    link.click();
  }

  shareLinkedIn(): void {
    const url = encodeURIComponent(window.location.origin + '/public/certificates/' + this.participant()?.certificateId);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }
}
