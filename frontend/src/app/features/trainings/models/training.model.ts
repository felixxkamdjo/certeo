export enum TrainingMode {
  InPerson = 0,
  Online = 1,
  Hybrid = 2
}

export enum TrainingStatus {
  Draft = 0,
  Published = 1,
  Open = 1,
  InProgress = 2,
  Completed = 3,
  Closed = 3,
  Cancelled = 4,
  Archived = 4
}

export interface ApplicationFieldConfig {
  field: number;
  isActive: boolean;
  isRequired: boolean;
}

export interface CustomQuestion {
  id?: string;
  label: string;
  type: string;
  isRequired: boolean;
  options?: string[];
}

export interface TrainingListItem {
  id: string;
  title: string;
  imageUrl: string | null;
  categoryLabel: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  applicationsCount: number;
  selectedCount: number;
  status: TrainingStatus;
}

export interface TrainingDetail extends TrainingListItem {
  description: string;
  categoryId: string;
  applicationDeadline: string;
  location: string;
  mode: TrainingMode;
  minCapacity: number;
  targetAudience: string | null;
  socialMediaMessage: string | null;
  promotionalPosterUrl: string | null;
  isQuizMandatory: boolean;
  isCertificateEnabled: boolean;
  slug: string;
  createdByFullName: string;
  createdAt: string;
  completionRatePercent: number;
  applicationFields: ApplicationFieldConfig[];
  customQuestions: CustomQuestion[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateTrainingRequest {
  title: string;
  description: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  location: string;
  mode: TrainingMode;
  maxCapacity: number;
  minCapacity: number;
  isQuizMandatory: boolean;
  isCertificateEnabled: boolean;
  publishImmediately: boolean;
  targetAudience?: string;
  applicationFields?: ApplicationFieldConfig[];
  customQuestions?: CustomQuestion[];
}

export interface TrainingCategory {
  id: string;
  label: string;
}
