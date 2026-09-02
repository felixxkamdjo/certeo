export interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  mode: 'Physique' | 'En ligne' | 'Hybride';
  capacity: number;
  participantsCount: number;
  acceptedCount: number;
  completionRate: number;
  status: TrainingStatus;
  cohort?: string;
  createdBy?: string;
  targetAudience?: string;
  socialPostText?: string;
  publicLink?: string;
  createdAt: string;
}

export enum TrainingStatus {
  Open = 'Ouverte',
  Closed = 'Fermée',
  Archived = 'Archivée',
  Draft = 'Brouillon',
}

export interface CreateTrainingDto {
  title: string;
  description: string;
  category: string;
  capacity: number;
  startDate: string;
  endDate: string;
  mode: 'Physique' | 'En ligne' | 'Hybride';
  targetAudience: string;
  socialPostText: string;
  status: TrainingStatus;
}

