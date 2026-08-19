import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '@shared';

interface TrainingHistory {
  name: string;
  dates: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  grade: string;
}

interface Skill {
  name: string;
  level: string;
  percentage: number;
}

interface Certificate {
  name: string;
  date: string;
}

interface ParticipantProfile {
  id: string;
  firstName: string;
  lastName: string;
  cohort: string;
  email: string;
  phone: string;
  location: string;
  profession: string;
  attendance: {
    percentage: number;
    total: number;
    attended: number;
    missed: number;
  };
  trainings: TrainingHistory[];
  skills: Skill[];
  certificates: Certificate[];
}

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

  readonly profile = signal<ParticipantProfile | null>(null);

  // Confirmation dialog for status reset / removal
  readonly isConfirmOpen = signal(false);
  readonly isConfirmLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.profile.set({
      id: id ?? '1',
      firstName: 'Amira',
      lastName: 'Benali',
      cohort: 'Cohorte Développement Full-Stack n°4',
      email: 'amira.benali@example.com',
      phone: '+221 77 123 45 67',
      location: 'Dakar, Sénégal',
      profession: 'Étudiante en Informatique',
      attendance: {
        percentage: 85,
        total: 42,
        attended: 36,
        missed: 6
      },
      trainings: [
        { name: 'Développement React Avancé', dates: 'Oct 2023 - Déc 2023', status: 'COMPLETED', grade: '92/100' },
        { name: 'Fondamentaux UI/UX', dates: 'Août 2023 - Sep 2023', status: 'COMPLETED', grade: '88/100' },
        { name: 'Architecture Cloud (AWS)', dates: 'Jan 2024 - En cours', status: 'IN_PROGRESS', grade: '-' }
      ],
      skills: [
        { name: 'Développement Frontend', level: 'Excellent', percentage: 90 },
        { name: 'Backend Node.js', level: 'Bien', percentage: 75 },
        { name: 'Résolution de problèmes', level: 'Très bien', percentage: 85 },
        { name: 'Communication', level: 'Moyen', percentage: 60 }
      ],
      certificates: [
        { name: 'Certification React 2023', date: '15 Déc 2023' },
        { name: 'Bases du Design UX', date: '30 Sep 2023' }
      ]
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

  onRemoveConfirm(): void {
    this.isConfirmLoading.set(true);
    // Simulate deletion
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
