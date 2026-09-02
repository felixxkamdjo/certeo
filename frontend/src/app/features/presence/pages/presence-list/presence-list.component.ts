import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '@shared/components/kpi-card/kpi-card';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableSearchComponent } from '@shared/components/table-search/table-search';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { PresenceEntry, PresenceStats } from '../../models/presence.model';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-presence-list',
  standalone: true,
  imports: [RouterLink, KpiCardComponent, PaginationComponent, TableSearchComponent, EmptyStateComponent],
  templateUrl: './presence-list.component.html',
  styleUrl: './presence-list.component.scss',
})
export class PresenceListComponent implements OnInit {
  private readonly presenceService = inject(PresenceService);

  readonly search           = signal('');
  readonly selectedDate     = signal(new Date().toISOString().slice(0, 10));
  readonly selectedTraining = signal('');
  readonly loading          = signal(false);
  readonly currentPage      = signal(1);
  readonly itemsPerPage     = 15;

  readonly stats   = signal<PresenceStats>({ todayTotal: 142, thisWeekTotal: 115, topReason: 'Formation Dev' });
  readonly entries = signal<PresenceEntry[]>(this.sampleEntries());

  readonly trainingOptions = computed(() => {
    const seen = new Set<string>();
    return this.entries()
      .map(e => e.trainingName)
      .filter((n): n is string => !!n && !seen.has(n) && (seen.add(n), true))
      .map(n => ({ value: n, label: n }));
  });

  readonly filteredEntries = computed(() => {
    const query    = this.search().trim().toLowerCase();
    const training = this.selectedTraining();
    return this.entries().filter(e => {
      const matchSearch   = !query    || `${e.visitorName} ${e.email} ${e.visitReason}`.toLowerCase().includes(query);
      const matchTraining = !training || e.trainingName === training;
      return matchSearch && matchTraining;
    });
  });

  readonly pagedEntries = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredEntries().slice(start, start + this.itemsPerPage);
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.presenceService.getAll(this.selectedDate()).subscribe({
      next: entries => { if (entries.length) this.entries.set(entries); },
      error: ()    => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
    this.presenceService.getStats().subscribe({ next: stats => this.stats.set(stats) });
  }

  private refreshEntries(): void {
    this.loading.set(true);
    this.presenceService.getAll(this.selectedDate()).subscribe({
      next: entries => { if (entries.length) this.entries.set(entries); },
      error: ()    => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  onFilterChange(filter: { key: string; value: string }): void {
    if (filter.key === 'date') {
      this.selectedDate.set(filter.value);
      this.refreshEntries();
    }
    if (filter.key === 'training') this.selectedTraining.set(filter.value);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedTraining.set('');
    this.selectedDate.set(new Date().toISOString().slice(0, 10));
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  /** Retourne la variante de couleur du badge selon le profil */
  profileVariant(profile: string | undefined): string {
    const p = (profile ?? '').toLowerCase();
    if (p.includes('étudiant') || p.includes('appren')) return 'info';
    if (p.includes('entrepreneur') || p.includes('partenaire')) return 'warning';
    if (p.includes('salarié') || p.includes('staff'))  return 'default';
    return 'neutral';
  }

  exportCsv(): void {
    this.presenceService.exportCsv(this.selectedDate()).subscribe({
      next: file => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `presence-${this.selectedDate()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: () => {
        const rows = this.filteredEntries().map(e => [e.visitorName, e.email, e.visitReason, e.checkInTime]);
        const csv  = [['Visiteur', 'Email', 'Motif', 'Heure'], ...rows].map(r => r.join(';')).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.download = `presence-${this.selectedDate()}.csv`;
        link.click();
      },
    });
  }

  private sampleEntries(): PresenceEntry[] {
    return [
      { id: '1', visitorName: 'Amina Njoya',    email: 'amina.njoya@email.com',    phone: '+237 690 12 34 56', visitReason: 'Formation Dev',    trainingName: 'Bootcamp Développement Web', profile: 'Étudiante',          checkInTime: '08:42' },
      { id: '2', visitorName: 'Thomas Bernard', email: 'thomas.bernard@email.com', phone: '+33 6 12 34 56 78',  visitReason: 'Accès coworking',  trainingName: 'Coworking ODC',              profile: 'Entrepreneur',        checkInTime: '09:15' },
      { id: '3', visitorName: 'Yasmine Diallo', email: 'yasmine.diallo@email.com', phone: '+221 77 123 45 67', visitReason: 'Renseignements',                                               profile: "Chercheur d'emploi",  checkInTime: '09:38' },
      { id: '4', visitorName: 'Paul Martin',    email: 'paul.martin@email.com',    phone: '+33 6 98 76 54 32', visitReason: 'Réunion',                                                      profile: 'Salarié',             checkInTime: '10:06' },
      { id: '5', visitorName: 'Fatou Bâ',       email: 'fatou.ba@email.com',       phone: '+221 77 654 32 10', visitReason: 'Formation Dev',    trainingName: 'Bootcamp Développement Web', profile: 'Étudiante',          checkInTime: '08:55' },
      { id: '6', visitorName: 'Ibrahim Coulibaly', email: 'i.coulibaly@email.com', phone: '+225 07 123 45 67', visitReason: 'Parcours découverte',                                          profile: 'Étudiant',           checkInTime: '11:20' },
    ];
  }
}
