export interface QuizAnswerResult {
  question: string;
  response: string;
  correction?: string;
  correct: boolean;
  points: string;
}

export interface QuizResultsData {
  score: number;           // pourcentage 0-100
  totalPoints: number;
  earnedPoints: number;
  moduleTitle: string;
  trainingLabel: string;
  completionDate: string;  // ISO 8601
  elapsedTime: string;
  questionCount: number;
  correctAnswers: number;
  incorrectAnswers: number;
  passingScore: number;
  passed: boolean;
  /** Présent uniquement si passed === true */
  certificateId?: string;
  answers: QuizAnswerResult[];
}
