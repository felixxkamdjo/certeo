import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { CandidateApplication, ApplicationStatus } from '../../models/application.model';

interface TimelineEntry {
  title: string;
  organization: string;
  period: string;
  description?: string;
  isCurrent?: boolean;
}

interface ApplicationDetail extends CandidateApplication {
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  currentJob?: string;
  hasLaptop?: boolean;
  discoverySource?: string;
  availability?: string;
  motivation?: string;
  timeline?: TimelineEntry[];
  cvFileName?: string;
  cvDate?: string;
}

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  readonly application = signal<ApplicationDetail | null>(null);
  readonly isLoading = signal(true);

  readonly ApplicationStatus = ApplicationStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // Mock data for development
    this.application.set({
      id: id ?? '1',
      trainingId: 'tr-1',
      trainingTitle: 'Développement Web Fullstack',
      firstName: 'Aminata',
      lastName: 'Diallo',
      email: 'aminata.d@example.com',
      phone: '+221 77 123 45 67',
      status: ApplicationStatus.Pending,
      createdAt: '2023-10-12T10:00:00Z',
      location: 'Dakar, Sénégal',
      linkedinUrl: 'https://linkedin.com/in/aminata-diallo',
      githubUrl: 'https://github.com/aminata-diallo',
      currentJob: 'Étudiante / Freelance',
      hasLaptop: true,
      discoverySource: 'Réseaux Sociaux (LinkedIn)',
      availability: 'Immédiate (Temps plein)',
      motivation: 'Passionnée par le développement web depuis mes années universitaires, j\'ai suivi avec un grand intérêt les initiatives de l\'Orange Digital Center. Je suis particulièrement motivée par l\'opportunité de rejoindre votre programme de formation intensive pour parfaire mes compétences en React et Node.js. Mon projet de fin d\'études portait sur une application de gestion de ressources locales, démontrant ma capacité à concevoir des solutions techniques pour des problèmes concrets.',
      cvFileName: 'CV_Aminata_Diallo.pdf',
      cvDate: '2023-10-12T00:00:00Z',
      timeline: [
        {
          title: 'Master en Génie Logiciel',
          organization: 'Université Cheikh Anta Diop (UCAD)',
          period: '2021 - 2023',
          isCurrent: true
        },
        {
          title: 'Stage Développeur Front-End',
          organization: 'TechSolutions Dakar',
          period: 'Juin 2022 - Sept 2022',
          description: 'Développement d\'interfaces utilisateurs avec Vue.js. Intégration d\'APIs REST et participation aux rituels agiles.'
        }
      ]
    });
    this.isLoading.set(false);
  }

  getInitials(): string {
    const app = this.application();
    if (!app) return '';
    return `${app.firstName.charAt(0)}${app.lastName.charAt(0)}`.toUpperCase();
  }

  getStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'En attente d\'évaluation',
      [ApplicationStatus.UnderReview]: 'En révision',
      [ApplicationStatus.Interview]: 'En entretien',
      [ApplicationStatus.Accepted]: 'Retenu',
      [ApplicationStatus.Rejected]: 'Refusé'
    };
    return labels[status];
  }

  getStatusType(status: ApplicationStatus): string {
    const types: Record<ApplicationStatus, string> = {
      [ApplicationStatus.Pending]: 'pending',
      [ApplicationStatus.UnderReview]: 'under-review',
      [ApplicationStatus.Interview]: 'interview',
      [ApplicationStatus.Accepted]: 'accepted',
      [ApplicationStatus.Rejected]: 'rejected'
    };
    return types[status];
  }

  goBack(): void {
    this.router.navigate(['/admin/applications']);
  }

  onEvaluate(): void { /* will connect to API */ }
  onInterview(): void { /* will connect to API */ }
  onReject(): void { /* will connect to API */ }
  onAccept(): void { /* will connect to API */ }
}
