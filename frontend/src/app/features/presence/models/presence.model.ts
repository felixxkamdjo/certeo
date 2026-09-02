export interface PresenceEntry {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  visitReason: string;
  trainingId?: string;
  trainingName?: string;
  profile?: string;
  gender?: string;
  ageRange?: string;
  latitude?: number;
  longitude?: number;
  checkInTime: string;
}

export interface PresenceStats {
  todayTotal: number;
  thisWeekTotal: number;
  topReason: string;
}

export interface PresenceCheckInDto {
  visitorName: string;
  email: string;
  phone: string;
  visitReason: string;
  trainingId?: string;
  gender?: string;
  ageRange?: string;
  profile?: string;
  latitude?: number;
  longitude?: number;
  token?: string;
}
