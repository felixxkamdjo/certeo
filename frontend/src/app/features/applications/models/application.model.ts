export interface CandidateApplication {
  id: string;
  trainingId: string;
  trainingTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  background?: string;
  experience?: string;
  motivation?: string;
  createdAt: string;
}

export enum ApplicationStatus {
  Pending = 'PENDING',
  UnderReview = 'UNDER_REVIEW',
  Interview = 'INTERVIEW',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}
