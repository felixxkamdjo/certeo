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
  startupName?: string;
  teamSize?: string | number;
  details?: string;
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
  startupName?: string;
  teamSize?: string | number;
  details?: string;
}

export type ReasonQuestionType = 'training' | 'coworking' | 'direct_confirm' | 'text_question';

export interface VisitReasonConfig {
  value: string;
  label: string; // Used in config and form
  icon: string;
  questionType: ReasonQuestionType;
  questionTitle: string;
  questionSubtitle: string;
  customFieldLabel?: string;
  customFieldPlaceholder?: string;
}

export interface ProfileConfig {
  value: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export const DEFAULT_PRESENCE_CONFIG = {
  fields: [
    { label: 'Nom complet',    controlName: 'visitorName', required: true,  enabled: true },
    { label: 'Adresse mail',   controlName: 'email',       required: true,  enabled: true },
    { label: 'Téléphone',      controlName: 'phone',       required: false, enabled: true },
    { label: 'Sexe',           controlName: 'gender',      required: false, enabled: true },
    { label: 'Tranche d\'âge', controlName: 'ageRange',    required: false, enabled: true },
    { label: 'Profil',         controlName: 'profile',     required: false, enabled: true },
  ],
  reasons: [
    {
      value: 'Renseignements',
      label: 'Renseignements',
      icon: 'info',
      questionType: 'text_question',
      questionTitle: 'Demande de renseignements',
      questionSubtitle: 'Précisez l\'objet de votre visite.',
      customFieldLabel: 'Quels sont les renseignements que vous souhaitez obtenir ?',
      customFieldPlaceholder: 'Ex: Informations sur les formations, partenariat...'
    } as VisitReasonConfig,
    {
      value: 'Parcours de découverte',
      label: 'Parcours de découverte',
      icon: 'explore',
      questionType: 'text_question',
      questionTitle: 'Parcours découverte',
      questionSubtitle: 'Précisions sur votre groupe.',
      customFieldLabel: 'Quelle est la structure ou association invitée à la découverte de ODC ?',
      customFieldPlaceholder: 'Ex: Université, Association...'
    } as VisitReasonConfig,
    {
      value: 'Développement d\'un projet',
      label: 'Développement d\'un projet',
      icon: 'rocket_launch',
      questionType: 'text_question',
      questionTitle: 'Votre projet',
      questionSubtitle: 'Indiquez les détails de votre projet.',
      customFieldLabel: 'Donnez des details sur le projet que vous venez développer ?',
      customFieldPlaceholder: 'Ex: Plateforme FinTech, Application mobile...'
    } as VisitReasonConfig,
    {
      value: 'Formation',
      label: 'Formation',
      icon: 'school',
      questionType: 'training',
      questionTitle: 'À quelle formation participez-vous ?',
      questionSubtitle: 'Sélectionnez la formation dans la liste ci-dessous.'
    } as VisitReasonConfig,
    {
      value: 'Animations ou événements(Meet & Share, Talks)',
      label: 'Animations ou événements(Meet & Share, Talks)',
      icon: 'celebration',
      questionType: 'text_question',
      questionTitle: 'Animation / Événement',
      questionSubtitle: 'Précisez l\'événement.',
      customFieldLabel: 'Quel est le nom de l\'événement ou de l\'animation à laquelle vous participez ?',
      customFieldPlaceholder: 'Ex: Talk IA, Meet & Share...'
    } as VisitReasonConfig,
    {
      value: 'Concours et Challenges',
      label: 'Concours et Challenges',
      icon: 'emoji_events',
      questionType: 'text_question',
      questionTitle: 'Concours ou Challenge',
      questionSubtitle: 'Précisez le concours.',
      customFieldLabel: 'Quel est le nom du concours ou challenge auquel vous participez ?',
      customFieldPlaceholder: 'Ex: Orange Summer Challenge...'
    } as VisitReasonConfig,
    {
      value: 'Accès au coworking Orange Fab',
      label: 'Accès au coworking Orange Fab',
      icon: 'desk',
      questionType: 'coworking',
      questionTitle: 'Espace Coworking',
      questionSubtitle: 'Veuillez préciser le nom de votre projet/startup et votre effectif.'
    } as VisitReasonConfig,
    {
      value: 'Réunion',
      label: 'Réunion',
      icon: 'groups',
      questionType: 'direct_confirm',
      questionTitle: 'Validation de votre réunion',
      questionSubtitle: 'Aucune information supplémentaire requise. Vous pouvez confirmer votre présence.'
    } as VisitReasonConfig,
    {
      value: 'Stagiaire',
      label: 'Stagiaire',
      icon: 'badge',
      questionType: 'direct_confirm',
      questionTitle: 'Présence Stagiaire',
      questionSubtitle: 'Aucune information supplémentaire requise. Cliquez sur confirmer pour enregistrer votre arrivée.'
    } as VisitReasonConfig,
  ],
  ageRanges: ['15-25', '26-35', '36-45', '45+'],
  profiles: [
    { value: 'Étudiant',            label: 'Étudiant',           icon: 'school',         enabled: true },
    { value: 'Salarié',             label: 'Salarié',            icon: 'work',           enabled: true },
    { value: 'Entrepreneur',        label: 'Entrepreneur',       icon: 'rocket_launch',  enabled: true },
    { value: 'Chercheur d\'emploi', label: 'Chercheur d\'emploi', icon: 'search',         enabled: true },
    { value: 'Retraité',            label: 'Retraité',           icon: 'elderly',        enabled: true },
  ] as ProfileConfig[]
};
