export interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  status: TrainingStatus;
  createdAt: string;
}

export enum TrainingStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

export interface CreateTrainingDto {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
}
