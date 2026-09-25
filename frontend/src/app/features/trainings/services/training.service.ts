import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Training, TrainingStatus, CreateTrainingDto } from '../models/training.model';

const MOCK_TRAININGS: Training[] = [
  {
    id: 'tr-1',
    title: 'Full-Stack Web Development',
    description: 'Ce programme immersif couvre l\'ensemble du cycle de développement d\'applications web avec React, Node.js, et PostgreSQL.',
    category: 'Développement Logiciel',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    location: 'Orange Digital Center Libreville',
    mode: 'Physique',
    capacity: 30,
    participantsCount: 24,
    acceptedCount: 150,
    completionRate: 85,
    status: TrainingStatus.Open,
    cohort: 'Cohorte 4 - Présentiel',
    createdBy: 'Orange Talent Admin',
    targetAudience: 'Étudiants, jeunes diplômés, reconversion professionnelle.',
    socialPostText: '🚀 Lancez votre carrière tech avec la formation Fullstack CERTEO ! 6 mois pour devenir un développeur complet. #DevWeb #OrangeDigitalCenter',
    publicLink: 'https://certeo.orange.com/apply/dev-fs-24',
    createdAt: '2023-11-01',
  },
  {
    id: 'tr-2',
    title: 'Design UI/UX Intensif',
    description: 'Maîtrisez les méthodologies de design centré utilisateur, du wireframing aux prototypes interactifs avec Figma.',
    category: 'Design & UX',
    startDate: '2023-11-01',
    endDate: '2023-11-30',
    location: 'Atelier - Hybride',
    mode: 'Hybride',
    capacity: 15,
    participantsCount: 15,
    acceptedCount: 45,
    completionRate: 92,
    status: TrainingStatus.Closed,
    cohort: 'Atelier - Hybride',
    createdBy: 'Orange Talent Admin',
    targetAudience: 'Designers juniors, chefs de projets web.',
    socialPostText: '🎨 Devenez Designer UI/UX certifié avec ODC ! #Design #UIUX',
    publicLink: 'https://certeo.orange.com/apply/uiux-2023',
    createdAt: '2023-10-01',
  },
  {
    id: 'tr-3',
    title: 'Introduction Data Science',
    description: 'Apprenez les fondamentaux de Python, de la manipulation de données et du machine learning.',
    category: 'Data & IA',
    startDate: '2023-09-10',
    endDate: '2023-10-10',
    location: 'En ligne (Teams/Zoom)',
    mode: 'En ligne',
    capacity: 50,
    participantsCount: 50,
    acceptedCount: 120,
    completionRate: 78,
    status: TrainingStatus.Archived,
    cohort: 'Session Virtuelle 1',
    createdBy: 'Orange Talent Admin',
    targetAudience: 'Analystes, ingénieurs et passionnés de data.',
    socialPostText: '📊 Découvrez la puissance de la Data Science avec Orange Digital Center ! #Data #Python',
    publicLink: 'https://certeo.orange.com/apply/ds-intro',
    createdAt: '2023-08-01',
  },
  {
    id: 'tr-4',
    title: 'Développement Mobile iOS',
    description: 'Créez des applications natives iOS performantes avec Swift et SwiftUI.',
    category: 'Développement Mobile',
    startDate: '2023-12-05',
    endDate: '2024-03-05',
    location: 'Orange Digital Center',
    mode: 'Physique',
    capacity: 20,
    participantsCount: 8,
    acceptedCount: 30,
    completionRate: 88,
    status: TrainingStatus.Open,
    cohort: 'Cohorte 1 - Présentiel',
    createdBy: 'Orange Talent Admin',
    targetAudience: 'Développeurs souhaitant se spécialiser sur l\'écosystème Apple.',
    socialPostText: '📱 Développez votre première app iOS avec SwiftUI chez ODC ! #Swift #iOS',
    publicLink: 'https://certeo.orange.com/apply/ios-c1',
    createdAt: '2023-11-15',
  },
];

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly api = inject(ApiService);
  private readonly _trainings = signal<Training[]>(MOCK_TRAININGS);

  readonly trainings = this._trainings.asReadonly();

  getAll(): Observable<Training[]> {
    return of(this._trainings());
  }

  getById(id: string): Observable<Training | undefined> {
    const training = this._trainings().find((t) => t.id === id);
    return of(training);
  }

  create(dto: CreateTrainingDto): Observable<Training> {
    const newTraining: Training = {
      id: `tr-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      startDate: dto.startDate,
      endDate: dto.endDate,
      location: dto.mode === 'Physique' ? 'Orange Digital Center' : 'En ligne',
      mode: dto.mode,
      capacity: dto.capacity,
      participantsCount: 0,
      acceptedCount: 0,
      completionRate: 0,
      status: dto.status || TrainingStatus.Open,
      cohort: 'Nouvelle Cohorte',
      createdBy: 'Orange Talent Admin',
      targetAudience: dto.targetAudience,
      socialPostText: dto.socialPostText,
      publicLink: `https://certeo.orange.com/apply/tr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this._trainings.update((list) => [newTraining, ...list]);
    return of(newTraining);
  }

  update(id: string, dto: Partial<CreateTrainingDto>): Observable<Training> {
    let updated: Training | undefined;
    this._trainings.update((list) =>
      list.map((t) => {
        if (t.id === id) {
          updated = { ...t, ...dto };
          return updated;
        }
        return t;
      })
    );
    return of(updated!);
  }

  delete(id: string): Observable<void> {
    this._trainings.update((list) => list.filter((t) => t.id !== id));
    return of(undefined);
  }
}

