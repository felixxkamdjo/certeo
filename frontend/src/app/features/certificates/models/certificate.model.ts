export interface Certificate {
  id: string;
  certificateNumber: string;
  recipientName: string;
  trainingTitle: string;
  completionDate: string;
  qrVerificationUrl: string;
  odcDirectorSignatureUrl?: string;
}
