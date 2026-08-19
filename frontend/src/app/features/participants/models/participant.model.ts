export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trainingId: string;
  trainingTitle?: string;
  evaluationsCount: number;
  averageScore?: number;
  certified: boolean;
  registeredAt: string;
}
