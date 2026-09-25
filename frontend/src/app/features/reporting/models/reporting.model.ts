export interface AnalyticsKpi {
  totalCandidates: number;
  totalVisitors: number;
  activeTrainings: number;
  certificationsDelivered: number;
}

export interface TrainingAnalytics {
  trainingId: string;
  trainingTitle: string;
  attendanceRate: number;
  successRate: number;
}
