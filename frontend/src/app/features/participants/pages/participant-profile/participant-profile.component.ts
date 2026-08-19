import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  imports: [CommonModule],
  templateUrl: './participant-profile.component.html',
  styleUrl: './participant-profile.component.scss'
})
export class ParticipantProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly profile = signal<ParticipantProfile | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // Mock data for development
    this.profile.set({
      id: id ?? '1',
      firstName: 'Amira',
      lastName: 'Benali',
      cohort: 'Full-Stack Development Cohort 4',
      email: 'amira.benali@example.com',
      phone: '+216 55 123 456',
      location: 'Tunis, Tunisia',
      profession: 'Computer Science Student',
      attendance: {
        percentage: 85,
        total: 42,
        attended: 36,
        missed: 6
      },
      trainings: [
        { name: 'Advanced React Patterns', dates: 'Oct 2023 - Dec 2023', status: 'COMPLETED', grade: '92/100' },
        { name: 'UX UI Foundations', dates: 'Aug 2023 - Sep 2023', status: 'COMPLETED', grade: '88/100' },
        { name: 'Cloud Architecture (AWS)', dates: 'Jan 2024 - Present', status: 'IN_PROGRESS', grade: '-' }
      ],
      skills: [
        { name: 'Frontend Development', level: 'Excellent', percentage: 90 },
        { name: 'Backend Node.js', level: 'Good', percentage: 75 },
        { name: 'Problem Solving', level: 'Very Good', percentage: 85 },
        { name: 'Communication', level: 'Average', percentage: 60 }
      ],
      certificates: [
        { name: 'React Mastery 2023', date: 'Dec 15, 2023' },
        { name: 'UX Design Basics', date: 'Sep 30, 2023' }
      ]
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/participants']);
  }
}
