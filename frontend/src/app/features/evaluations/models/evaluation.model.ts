// ============================================================
// Modèles du module Evaluations — CERTEO
// ============================================================

// --- Entité principale ---
export interface Evaluation {
  id: string;
  title: string;
  trainingId: string;
  trainingName: string;
  /** Type d'évaluation, ex. "QCM" */
  type: string;
  questionCount: number;
  /** Durée estimée en minutes */
  duration?: number;
  description?: string;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  createdAt: string;
}

// --- Statistiques globales ---
export interface EvaluationStatistics {
  totalEvaluations: number;
  totalParticipations: number;
  averageScore: number;
}

// --- Données complètes chargées depuis l'API/mock ---
export interface EvaluationsData {
  items: Evaluation[];
  statistics: EvaluationStatistics;
}

// --- DTO envoi d'évaluation ---
export interface SendEvaluationDto {
  trainingId: string;
  evaluationId: string;
  instructions?: string;
}
