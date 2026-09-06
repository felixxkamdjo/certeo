export enum ParticipantStatus {
  ACTIVE = 0,
  ON_HOLD = 1,
  COMPLETED = 2,
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string | null;
  country?: string | null;
  currentOccupation?: string | null;
  trainingId: string;
  trainingTitle?: string;
  evaluationsCount: number;
  averageScore?: number | null;
  certified: boolean;
  registeredAt: string;
  status: ParticipantStatus;
  attendanceRate: number;
}
