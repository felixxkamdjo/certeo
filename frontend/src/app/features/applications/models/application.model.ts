// src/app/features/applications/models/application.model.ts

export enum ApplicationStatus {
  Pending = 0,
  InInterview = 1,
  Evaluated = 2,
  Selected = 3,
  Rejected = 4,
}

export interface ApplicationListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  trainingId: string;
  trainingTitle: string;
  applicationDate: string;
  status: ApplicationStatus;
}

export interface ApplicationAnswer {
  trainingQuestionId: string;
  prompt: string;
  value: string;
}

// Miroir de ApplicationDetailResponse.
export interface ApplicationDetail {
  id: string;
  trainingId: string;
  trainingTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string | null;
  country?: string | null;
  genderLabel?: string | null;
  dateOfBirth?: string | null;
  educationLevelLabel?: string | null;
  schoolOrUniversity?: string | null;
  graduationYear?: number | null;
  specialization?: string | null;
  currentOccupation?: string | null;
  cvUrl: string;
  portfolioUrl?: string | null;
  hasPersonalComputer?: boolean | null;
  coverLetter?: string | null;
  odcDiscoverySourceLabel?: string | null;
  fileNumber: string;
  status: ApplicationStatus;
  applicationDate: string;
  answers: ApplicationAnswer[];
}
