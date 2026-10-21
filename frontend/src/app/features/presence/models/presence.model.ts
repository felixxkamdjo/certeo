// Define KPI summary for presence dashboard
export interface PresenceKpis {
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
export interface PresencePagedResult {
  items: AttendanceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  kpis?: PresenceKpis;
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

// Define check-in payload submitted by visitor form
export interface PresenceCheckInDto {
  visitorName: string;
  email: string;
  phone: string;
  gender: string;
  ageRange: string;
  profile: string;
  visitReason: string;
  trainingId?: string;
  startupName?: string;
  teamSize?: string;
  details?: string;
  token?: string;
  latitude?: number;
  longitude?: number;
}

// Represent visitor profile option configuration
export interface ProfileConfig {
  value: string;
  label: string;
  icon: string;
  enabled: boolean;
}

// Represent visit reason category configuration
export interface VisitReasonConfig {
  value: string;
  label: string;
  icon: string;
  questionType: 'training' | 'coworking' | 'text_question' | 'direct_confirm';
  questionTitle: string;
  questionSubtitle: string;
  customFieldLabel?: string;
  customFieldPlaceholder?: string;
}

// Represent form personal field configuration
export interface FormFieldConfig {
  label: string;
  controlName: string;
  required: boolean;
  enabled: boolean;
}

// Provide single source of truth for presence form setup
export interface PresenceConfig {
  fields: FormFieldConfig[];
  reasons: VisitReasonConfig[];
  ageRanges: string[];
  profiles: ProfileConfig[];
}

// Initialize default presence configuration data
export const DEFAULT_PRESENCE_CONFIG: PresenceConfig = {
  fields: [
    { label: 'Nom complet', controlName: 'visitorName', required: true, enabled: true },
    { label: 'Adresse mail', controlName: 'email', required: true, enabled: true },
    { label: 'Téléphone', controlName: 'phone', required: true, enabled: true },
    { label: 'Sexe', controlName: 'gender', required: true, enabled: true },
    { label: 'Tranche d\'âge', controlName: 'ageRange', required: true, enabled: true },
    { label: 'Profil', controlName: 'profile', required: true, enabled: true },
    { label: 'Motif de présence', controlName: 'visitReason', required: true, enabled: true },
  ],
  reasons: [
    {
      value: 'Formation',
      label: 'Formation',
      icon: 'school',
      questionType: 'training',
      questionTitle: 'À quelle formation participez-vous ?',
      questionSubtitle: 'Sélectionnez votre cohorte ou formation en cours.'
    },
    {
      value: 'Accès coworking',
      label: 'Accès coworking',
      icon: 'desk',
      questionType: 'coworking',
      questionTitle: 'Précisions sur votre espace coworking',
      questionSubtitle: 'Renseignez le nom de votre projet et la taille de l\'équipe.'
    },
    {
      value: 'Événement',
      label: 'Événement',
      icon: 'event',
      questionType: 'text_question',
      questionTitle: 'Nom de l\'événement',
      questionSubtitle: 'Indiquez l\'intitulé de l\'événement ou conférence.',
      customFieldLabel: 'Intitulé de l\'événement',
      customFieldPlaceholder: 'Ex: Hackathon, Conférence Web3...'
    },
    {
      value: 'Challenge',
      label: 'Challenge',
      icon: 'emoji_events',
      questionType: 'text_question',
      questionTitle: 'Nom du challenge',
      questionSubtitle: 'Indiquez le challenge ou concours auquel vous participez.',
      customFieldLabel: 'Nom du challenge',
      customFieldPlaceholder: 'Ex: Orange Summer Challenge...'
    },
    {
      value: 'Renseignement',
      label: 'Renseignement',
      icon: 'info',
      questionType: 'direct_confirm',
      questionTitle: 'Validation de votre visite',
      questionSubtitle: 'Confirmez votre arrivée à l\'accueil.'
    },
    {
      value: 'Réunion',
      label: 'Réunion',
      icon: 'groups',
      questionType: 'direct_confirm',
      questionTitle: 'Validation de votre réunion',
      questionSubtitle: 'Confirmez votre arrivée pour votre rendez-vous.'
    },
    {
      value: 'Stagiaire',
      label: 'Stagiaire',
      icon: 'badge',
      questionType: 'direct_confirm',
      questionTitle: 'Pointage stagiaire',
      questionSubtitle: 'Confirmez votre journée de stage.'
    },
    {
      value: 'Autre motif',
      label: 'Autre motif',
      icon: 'more_horiz',
      questionType: 'text_question',
      questionTitle: 'Précisez votre motif',
      questionSubtitle: 'Indiquez l\'objet de votre passage au centre.',
      customFieldLabel: 'Motif détaillé',
      customFieldPlaceholder: 'Ex: Dépôt de document, rencontre équipe...'
    }
  ],
  ageRanges: ['< 18 ans', '18 - 25 ans', '26 - 35 ans', '> 35 ans'],
  profiles: [
    { value: 'Étudiante', label: 'Étudiante', icon: 'school', enabled: true },
    { value: 'Étudiant', label: 'Étudiant', icon: 'school', enabled: true },
    { value: 'Entrepreneur', label: 'Entrepreneur', icon: 'rocket_launch', enabled: true },
    { value: 'Chercheur d\'emploi', label: 'Chercheur d\'emploi', icon: 'person_search', enabled: true },
    { value: 'Salarié', label: 'Salarié', icon: 'work', enabled: true },
    { value: 'Autre', label: 'Autre', icon: 'person', enabled: true }
  ]
};
