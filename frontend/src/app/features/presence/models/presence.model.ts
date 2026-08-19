export interface PresenceEntry {
  id: string;
  visitorName: string;
  email: string;
  phone: string;
  visitReason: string;
  trainingId?: string;
  checkInTime: string;
}

export interface PresenceStats {
  todayTotal: number;
  thisWeekTotal: number;
  topReason: string;
}
