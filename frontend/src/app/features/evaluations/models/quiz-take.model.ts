export interface QuizQuestion {
  title: string;
  options: string[];
  answer: number; // index 0-based de la bonne réponse
}

export interface QuizTakeData {
  quizTitle: string;
  trainingLabel: string;
  /** Consignes rédigées par l'admin lors de l'envoi — affichées avant le début du quiz */
  instructions?: string;
  questions: QuizQuestion[];
  initialQuestionIndex: number;
  /** Durée en secondes */
  durationSeconds: number;
}
