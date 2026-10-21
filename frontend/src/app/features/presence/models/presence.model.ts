// Define KPI summary for attendance dashboard
export interface AttendanceKpis {
  todayCount: number;
  weeklyAverage: number;
  percentageTrend: number;
  mostFrequentReason: string;
  mostFrequentReasonPercentage: number;
}

// Represent an attendance record with geofencing details
export interface AttendanceItem {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  profileLabel?: string;
  profileCode?: string;
  visitReasonId: string;
  visitReasonLabel: string;
  trainingId?: string | null;
  trainingTitle?: string | null;
  latitude: number;
  longitude: number;
  distanceFromCenterMeters: number;
  isValid: boolean;
  timestamp: string;
}

// Wrap paginated attendance items with metadata
export interface AttendancePagedResult {
  items: AttendanceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  kpis?: AttendanceKpis;
}

// Encapsulate dynamic QR code details for access check-in
export interface QrCodeDetails {
  token: string;
  location: string;
  generatedAt: string;
  expiresAt: string;
  isActive: boolean;
  qrCodeUrl?: string;
}

// Represent payload to submit attendance with coordinates
export interface RecordAttendanceCommand {
  participantId?: string;
  visitorFirstName?: string;
  visitorLastName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitReasonId: string;
  trainingId?: string;
  latitude: number;
  longitude: number;
  qrCodeToken: string;
}
