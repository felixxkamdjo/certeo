import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '@shared';
import { ParticipantService } from '../../services/participant.service';
import { Participant } from '../../models/participant.model';

@Component({
  selector: 'app-participant-profile',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './participant-profile.component.html',
  styleUrl: './participant-profile.component.scss'
})
export class ParticipantProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly participantService = inject(ParticipantService);

  readonly profile = signal<Participant | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly isConfirmOpen = signal(false);
  readonly isConfirmLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set('Identifiant participant manquant.');
      this.isLoading.set(false);
      return;
    }

    this.participantService.getById(id).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Participant introuvable.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/participants']);
  }

  onContact(): void {
    const p = this.profile();
    if (p) {
      this.router.navigate(['/admin/applications/email'], {
        queryParams: { candidateId: p.id }
      });
    }
  }

  onEvaluate(): void {
    this.router.navigate(['/admin/evaluations']);
  }

  // not endpoint DELETE yet
  onRemoveConfirm(): void {
    this.isConfirmLoading.set(true);
    setTimeout(() => {
      this.isConfirmLoading.set(false);
      this.isConfirmOpen.set(false);
      this.router.navigate(['/admin/participants']);
    }, 700);
  }

  onRemoveCancel(): void {
    this.isConfirmOpen.set(false);
  }

  openRemoveDialog(): void {
    this.isConfirmOpen.set(true);
  }
}
