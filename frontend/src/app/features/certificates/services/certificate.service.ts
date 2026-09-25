import { Injectable, signal } from '@angular/core';

export interface CertificateParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  trainingTitle: string;
  hasCertificate: boolean;
  certificatePdfUrl?: string;
  certificateId?: string; // Example: CRT-8492-FX
}

export interface MatchResult {
  fileName: string;
  fileSize: number;
  matchedParticipant?: CertificateParticipant;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  // Mock list of participants for certificates module
  readonly participants = signal<CertificateParticipant[]>([
    {
      id: 'p1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      trainingTitle: 'Développement Full-Stack Avancé',
      hasCertificate: true,
      certificatePdfUrl: '/assets/certificates/Jean Dupont ODC.pdf',
      certificateId: 'CRT-8492-FX'
    },
    {
      id: 'p2',
      firstName: 'Amira',
      lastName: 'Benali',
      email: 'amira.benali@example.com',
      trainingTitle: 'Développement Full-Stack Avancé',
      hasCertificate: true,
      certificatePdfUrl: '/assets/certificates/Jean Dupont ODC.pdf',
      certificateId: 'CRT-1234-AB'
    },
    {
      id: 'p3',
      firstName: 'Karim',
      lastName: 'Ndiaye',
      email: 'karim.ndiaye@example.com',
      trainingTitle: 'Développement Full-Stack Avancé',
      hasCertificate: false
    }
  ]);

  constructor() {}

  /**
   * Cleans a string to help with matching
   * Example: "certificat_jean_dupont.pdf" -> "jeandupont"
   */
  private normalizeForMatching(str: string): string {
    return str.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/certificat|certif|attestation/g, '')
      .replace(/\.pdf|\.png|\.jpg|\.jpeg/g, '')
      .replace(/[^a-z0-9]/g, ''); // Remove spaces, dashes, underscores
  }

  /**
   * Simulates matching a list of files with participants
   */
  matchFilesWithParticipants(files: File[]): MatchResult[] {
    const results: MatchResult[] = [];
    const currentParticipants = this.participants();

    for (const file of files) {
      const normalizedFileName = this.normalizeForMatching(file.name);
      
      // Try to find a participant whose first+last name or last+first name matches the filename
      const matchedParticipant = currentParticipants.find(p => {
        const name1 = this.normalizeForMatching(`${p.firstName}${p.lastName}`);
        const name2 = this.normalizeForMatching(`${p.lastName}${p.firstName}`);
        return normalizedFileName.includes(name1) || normalizedFileName.includes(name2);
      });

      results.push({
        fileName: file.name,
        fileSize: file.size,
        matchedParticipant: matchedParticipant,
        success: !!matchedParticipant
      });
    }

    return results;
  }

  /**
   * Applies the matched certificates
   */
  applyMatches(matches: MatchResult[]): void {
    this.participants.update(list => {
      const updated = [...list];
      for (const match of matches) {
        if (match.success && match.matchedParticipant) {
          const index = updated.findIndex(p => p.id === match.matchedParticipant!.id);
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              hasCertificate: true,
              certificatePdfUrl: '#', // In reality, we'd upload the file and get a URL
              certificateId: this.generateCertificateId(updated[index].lastName)
            };
          }
        }
      }
      return updated;
    });
  }

  private generateCertificateId(lastName: string): string {
    const randomValue = new Uint32Array(1);
    globalThis.crypto.getRandomValues(randomValue);
    const randomDigits = 1000 + (randomValue[0] % 9000);
    return `CRT-${randomDigits}-${lastName.substring(0, 2).toUpperCase()}`;
  }

  getParticipant(id: string): CertificateParticipant | undefined {
    return this.participants().find(p => p.id === id);
  }

  getParticipantByCertId(certId: string): CertificateParticipant | undefined {
    const existing = this.participants().find(p => p.certificateId === certId);
    if (existing) {
      return existing;
    }
    // Fallback mock for testing any certificate ID
    if (certId) {
      return {
        id: 'p-mock',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        trainingTitle: 'Développement Full-Stack Avancé',
        hasCertificate: true,
        certificatePdfUrl: '/assets/certificates/Jean Dupont ODC.pdf',
        certificateId: certId
      };
    }
    return undefined;
  }
}
