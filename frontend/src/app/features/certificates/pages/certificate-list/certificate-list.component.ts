import { Component, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CertificateService, MatchResult } from '../../services/certificate.service';
import { KpiCardComponent, PaginationComponent } from '@shared';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, PaginationComponent],
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss'
})
export class CertificateListComponent {
  private readonly certificateService = inject(CertificateService);
  private readonly router = inject(Router);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly searchTerm = signal('');
  readonly trainingFilter = signal('');
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(10);

  // Modal states
  readonly isImportModalOpen = signal(false);
  readonly matchResults = signal<MatchResult[]>([]);
  readonly isImporting = signal(false);

  readonly allParticipants = this.certificateService.participants;

  readonly filteredParticipants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const training = this.trainingFilter();
    
    return this.allParticipants().filter(p => {
      const matchesSearch = !term || 
        p.firstName.toLowerCase().includes(term) || 
        p.lastName.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term);
      const matchesTraining = !training || p.trainingTitle === training;
      return matchesSearch && matchesTraining;
    });
  });

  readonly kpis = computed(() => {
    const total = this.allParticipants().length;
    const generated = this.allParticipants().filter(p => p.hasCertificate).length;
    const pending = total - generated;
    return { total, generated, pending };
  });

  readonly pagedParticipants = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredParticipants().slice(start, start + this.itemsPerPage());
  });

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onTrainingChange(value: string): void {
    this.trainingFilter.set(value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  viewCertificate(certId: string): void {
    this.router.navigate(['/admin/certificates', certId]);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files);
      const results = this.certificateService.matchFilesWithParticipants(filesArray);
      this.matchResults.set(results);
      this.isImportModalOpen.set(true);
      // Reset input so the same files can be selected again if needed
      input.value = '';
    }
  }

  get successfulMatchesCount(): number {
    return this.matchResults().filter(r => r.success).length;
  }

  confirmImport(): void {
    this.isImporting.set(true);
    // Simulate network delay
    setTimeout(() => {
      this.certificateService.applyMatches(this.matchResults());
      this.isImporting.set(false);
      this.isImportModalOpen.set(false);
      this.matchResults.set([]);
    }, 1000);
  }

  cancelImport(): void {
    this.isImportModalOpen.set(false);
    this.matchResults.set([]);
  }
}
