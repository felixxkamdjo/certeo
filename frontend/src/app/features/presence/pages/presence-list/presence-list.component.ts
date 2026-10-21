import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { PresenceService } from '../../services/presence.service';
import { AttendanceItem, PresenceKpis } from '../../models/presence.model';
import {
  KpiCardComponent,
  PaginationComponent,
  TableSearchComponent,
  EmptyStateComponent
} from '@shared';
import { combineLatest, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

// Shape internal attendance entry aligned with develop template bindings
export interface PresenceEntryRow {
  id: string;
  visitorName: string;
  email: string;
  phone?: string;
  profile?: string;
  visitReason: string;
  trainingName?: string;
  checkInTime: string;
}

@Component({
  selector: 'app-presence-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    KpiCardComponent,
    PaginationComponent,
    TableSearchComponent,
    EmptyStateComponent
  ],
  templateUrl: './presence-list.component.html',
  styleUrl: './presence-list.component.scss'
})
export class PresenceListComponent {
  private readonly presenceService = inject(PresenceService);

  // Define pagination sizing constant
  readonly itemsPerPage = 15;

  // Manage reactive query filter signals
  readonly search = signal<string>('');
  readonly selectedDate = signal<string>(new Date().toISOString().slice(0, 10));
  readonly selectedTraining = signal<string>('');
  readonly currentPage = signal<number>(1);

  // Manage selected presence detail state
  readonly selectedDetail = signal<AttendanceItem | null>(null);
  readonly isDetailOpen = signal<boolean>(false);
  readonly isDetailLoading = signal<boolean>(false);

  // Trigger manual data reload pipeline
  private readonly refreshTrigger = signal<number>(0);

  // Combine query filters into a reactive data retrieval stream
  private readonly attendanceData$ = combineLatest([
    toObservable(this.search),
    toObservable(this.selectedDate),
    toObservable(this.selectedTraining),
    toObservable(this.currentPage),
    toObservable(this.refreshTrigger)
  ]).pipe(
    switchMap(([searchTerm, date, trainingId, page]) =>
      this.presenceService.getAttendances(
        page,
        this.itemsPerPage,
        searchTerm || undefined,
        date || undefined,
        trainingId || undefined
      ).pipe(
        catchError(err => {
          // Log communication error gracefully
          console.error('Failed to load attendances from backend', err);
          return of({
            items: [] as AttendanceItem[],
            totalCount: 0,
            page: 1,
            pageSize: this.itemsPerPage,
            totalPages: 1,
            kpis: { todayCount: 0, weeklyAverage: 0, percentageTrend: 0, mostFrequentReason: 'Aucun', mostFrequentReasonPercentage: 0 } as PresenceKpis
          });
        })
      )
    )
  );

  // Store server response into a reactive readonly signal
  readonly response = toSignal(this.attendanceData$, {
    initialValue: {
      items: [] as AttendanceItem[],
      totalCount: 0,
      page: 1,
      pageSize: this.itemsPerPage,
      totalPages: 1,
      kpis: { todayCount: 0, weeklyAverage: 0, percentageTrend: 0, mostFrequentReason: 'Aucun', mostFrequentReasonPercentage: 0 } as PresenceKpis
    }
  });

  // Map server attendance items to presentation model
  readonly rawEntries = computed<PresenceEntryRow[]>(() =>
    this.response().items.map(item => ({
      id: item.id,
      visitorName: item.fullName || `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Visiteur',
      email: item.email,
      phone: item.phone,
      profile: item.profileLabel,
      visitReason: item.visitReasonLabel,
      trainingName: item.trainingTitle ?? undefined,
      checkInTime: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    }))
  );

  // Fetch and open attendance detail dialog
  viewDetails(record: PresenceEntryRow): void {
    this.isDetailLoading.set(true);
    this.isDetailOpen.set(true);
    this.presenceService.getAttendanceById(record.id).subscribe({
      next: (data) => {
        this.selectedDetail.set(data);
        this.isDetailLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load attendance detail', err);
        this.isDetailLoading.set(false);
      }
    });
  }

  // Close detail dialog and reset selection
  closeDetail(): void {
    this.isDetailOpen.set(false);
    this.selectedDetail.set(null);
  }

  // Compute filtered entries array matching search input
  readonly filteredEntries = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.rawEntries().filter(e =>
      !term ||
      e.visitorName.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      e.visitReason.toLowerCase().includes(term) ||
      (e.trainingName?.toLowerCase().includes(term) ?? false)
    );
  });

  // Extract paginated entries slice for active view
  readonly pagedEntries = computed(() => {
    const all = this.filteredEntries();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return all.slice(start, start + this.itemsPerPage);
  });

  // Expose computed KPIs formatted for app-kpi-card bindings
  readonly stats = computed(() => {
    const k = this.response().kpis;
    return {
      todayTotal: k?.todayCount ?? this.response().totalCount,
      thisWeekTotal: k?.weeklyAverage ?? 115,
      topReason: k?.mostFrequentReason ?? 'Formation Dev'
    };
  });

  // Extract unique training titles for dropdown filter
  readonly trainingOptions = computed(() => {
    const seen = new Set<string>();
    return this.rawEntries()
      .map(e => e.trainingName)
      .filter((n): n is string => !!n && n !== '—' && !seen.has(n) && (seen.add(n), true))
      .map(n => ({ value: n, label: n }));
  });

  // Resolve status badge theme variant based on profile name
  profileVariant(profile: string | undefined): string {
    const p = (profile ?? '').toLowerCase();
    if (p.includes('étudiant') || p.includes('appren')) return 'info';
    if (p.includes('entrepreneur') || p.includes('partenaire')) return 'warning';
    if (p.includes('salarié') || p.includes('staff')) return 'default';
    return 'neutral';
  }

  // Update text query filter signal
  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  // Handle generic table filter changes
  onFilterChange(filter: { key: string; value: string }): void {
    if (filter.key === 'date') {
      this.selectedDate.set(filter.value);
    }
    if (filter.key === 'training') {
      this.selectedTraining.set(filter.value);
    }
    this.currentPage.set(1);
  }

  // Restore filter signals to default parameters
  resetFilters(): void {
    this.search.set('');
    this.selectedTraining.set('');
    this.selectedDate.set(new Date().toISOString().slice(0, 10));
    this.currentPage.set(1);
  }

  // Navigate across pagination index pages
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // Trigger presence spreadsheet export stream
  exportCsv(): void {
    this.presenceService.exportCsv(this.selectedDate() || undefined, this.selectedTraining() || undefined)
      .subscribe({
        next: file => {
          // Download file blob directly
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.download = `presence-${this.selectedDate()}.csv`;
          link.click();
          URL.revokeObjectURL(link.href);
        },
        error: () => {
          // Fallback to local CSV generation
          const rows = this.filteredEntries().map(e => [e.visitorName, e.email, e.visitReason, e.checkInTime]);
          const csv = [['Visiteur', 'Email', 'Motif', 'Heure'], ...rows].map(r => r.join(';')).join('\n');
          const link = document.createElement('a');
          link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
          link.download = `presence-${this.selectedDate()}.csv`;
          link.click();
        }
      });
  }
}
