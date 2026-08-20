import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PresenceEntry, PresenceStats } from '../../models/presence.model';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-presence-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './presence-list.component.html',
  styleUrl: './presence-list.component.scss'
})
export class PresenceListComponent implements OnInit {
  private readonly presenceService = inject(PresenceService);
  readonly search = signal('');
  readonly selectedDate = signal(new Date().toISOString().slice(0, 10));
  readonly selectedTraining = signal('all');
  readonly loading = signal(false);
  readonly stats = signal<PresenceStats>({ todayTotal: 142, thisWeekTotal: 115, topReason: 'Formation Dev' });
  readonly entries = signal<PresenceEntry[]>(this.sampleEntries());

  readonly trainingNames = computed(() => [...new Set(this.entries().map((entry) => entry.trainingName).filter(Boolean))]);
  readonly filteredEntries = computed(() => {
    const query = this.search().trim().toLowerCase();
    const training = this.selectedTraining();
    return this.entries().filter((entry) => {
      const matchesQuery = !query || `${entry.visitorName} ${entry.email} ${entry.visitReason}`.toLowerCase().includes(query);
      const matchesTraining = training === 'all' || entry.trainingName === training;
      return matchesQuery && matchesTraining;
    });
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.presenceService.getAll(this.selectedDate()).subscribe({
      next: (entries) => { if (entries.length) this.entries.set(entries); },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
    this.presenceService.getStats().subscribe({ next: (stats) => this.stats.set(stats) });
  }

  updateDate(value: string): void {
    this.selectedDate.set(value);
    this.ngOnInit();
  }

  exportCsv(): void {
    this.presenceService.exportCsv(this.selectedDate()).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `presence-${this.selectedDate()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        const rows = this.filteredEntries().map((entry) => [entry.visitorName, entry.email, entry.visitReason, entry.checkInTime]);
        const csv = [['Visiteur', 'Email', 'Motif', 'Heure'], ...rows].map((row) => row.join(';')).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.download = `presence-${this.selectedDate()}.csv`;
        link.click();
      },
    });
  }

  private sampleEntries(): PresenceEntry[] {
    return [
      { id: '1', visitorName: 'Amina Njoya', email: 'amina.njoya@email.com', phone: '+237 690 12 34 56', visitReason: 'Formation Dev', trainingName: 'Bootcamp Développement Web', profile: 'Étudiante', checkInTime: '08:42' },
      { id: '2', visitorName: 'Thomas Bernard', email: 'thomas.bernard@email.com', phone: '+33 6 12 34 56 78', visitReason: 'Accès coworking', trainingName: 'Coworking ODC', profile: 'Entrepreneur', checkInTime: '09:15' },
      { id: '3', visitorName: 'Yasmine Diallo', email: 'yasmine.diallo@email.com', phone: '+221 77 123 45 67', visitReason: 'Renseignements', profile: 'Chercheuse d’emploi', checkInTime: '09:38' },
      { id: '4', visitorName: 'Paul Martin', email: 'paul.martin@email.com', phone: '+33 6 98 76 54 32', visitReason: 'Réunion', profile: 'Salarié', checkInTime: '10:06' },
    ];
  }
}
