// ============================================================
// Modèles du module Settings — alignés sur SystemSettings backend
// ============================================================

export interface SystemSettings {
  id?: string;

  // Général
  applicationName: string;
  logoUrl:         string | null;
  timeZone:        string;

  // Notifications
  isNewApplicationAlertEnabled:  boolean;
  isTrainingReminderAlertEnabled: boolean;
  isSystemUpdateAlertEnabled:    boolean;

  // Sécurité
  sessionTimeoutMinutes:       number;
  minPasswordLength:           number;
  isPasswordUppercaseRequired: boolean;
  isPasswordSpecialCharRequired: boolean;
  passwordExpirationDays:      number | null;

  // Intégrations
  isLinkedInSharingAllowed: boolean;
  linkedInApiKeySet:        boolean; // ne jamais exposer la clé chiffrée
  isOdcSyncActive:          boolean;

  // SMTP (optionnel — page de config avancée)
  smtpHost:        string | null;
  smtpPort:        number | null;
  smtpUsername:    string | null;
  smtpPasswordSet: boolean;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  applicationName:               'CERTEO',
  logoUrl:                       null,
  timeZone:                      'Europe/Paris',
  isNewApplicationAlertEnabled:  true,
  isTrainingReminderAlertEnabled: true,
  isSystemUpdateAlertEnabled:    false,
  sessionTimeoutMinutes:         30,
  minPasswordLength:             8,
  isPasswordUppercaseRequired:   true,
  isPasswordSpecialCharRequired: true,
  passwordExpirationDays:        90,
  isLinkedInSharingAllowed:      false,
  linkedInApiKeySet:             false,
  isOdcSyncActive:               false,
  smtpHost:                      null,
  smtpPort:                      587,
  smtpUsername:                  null,
  smtpPasswordSet:               false,
};

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Paris',    label: '(GMT+01:00) Central European Time — Paris' },
  { value: 'GMT',             label: '(GMT+00:00) Greenwich Mean Time' },
  { value: 'Africa/Tunis',    label: '(GMT+01:00) Tunis' },
  { value: 'Africa/Dakar',    label: '(GMT+00:00) Dakar' },
  { value: 'Africa/Douala',   label: '(GMT+01:00) Douala' },
  { value: 'Africa/Abidjan',  label: '(GMT+00:00) Abidjan' },
];

export const SESSION_TIMEOUT_OPTIONS = [
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 heure' },
  { value: 240, label: '4 heures' },
];
