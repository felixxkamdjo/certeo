// Interface générique de pagination retournée par le backend .NET
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

// Statuts des candidatures
export enum ApplicationStatus {
  Pending = 'PENDING',
  UnderReview = 'UNDER_REVIEW',
  Interview = 'INTERVIEW',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}

// Entrée d'étape dans le parcours professionnel / académique
export interface TimelineEntry {
  title: string;
  organization: string;
  period: string;
  description?: string;
  isCurrent?: boolean;
}

// Modèle pour la liste (ApplicationListItemResponse côté .NET)
export interface CandidateApplication {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  trainingId: string;
  trainingTitle?: string;
  applicationDate: string;
  createdAt?: string;
  status: ApplicationStatus | number | string;
}

// Modèle complet pour la fiche détaillée (ApplicationDetailResponse côté .NET + UI)
export interface ApplicationDetail {
  id: string;
  trainingId: string;
  trainingTitle?: string;
  fileNumber?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;

  // Localisation
  city?: string | null;
  country?: string | null;
  location?: string;

  // Profil et Liens
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;

  // Référentiels & Identité
  genderId?: string | null;
  genderLabel?: string | null;
  dateOfBirth?: string | null;
  educationLevelId?: string | null;
  educationLevelLabel?: string | null;
  schoolOrUniversity?: string | null;
  graduationYear?: number | null;
  specialization?: string | null;

  // Situation professionnelle & équipement
  currentJob?: string;
  currentOccupation?: string | null;
  hasLaptop?: boolean;
  hasPersonalComputer?: boolean | null;

  // Découverte & Disponibilité
  discoverySource?: string;
  odcDiscoverySourceId?: string | null;
  odcDiscoverySourceLabel?: string | null;
  availability?: string;

  // Documents
  cvUrl?: string;
  cvFileName?: string;
  cvDate?: string;

  // Lettre et Parcours
  motivation?: string;
  coverLetter?: string | null;
  timeline?: TimelineEntry[];

  // Statut & Dates
  status: ApplicationStatus | number | string;
  applicationDate?: string;
  createdAt?: string;
}
