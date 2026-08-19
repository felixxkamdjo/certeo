export interface QuizAnswerResult {
  question: string;
  response: string;
  correction?: string;
  correct: boolean;
  points: string;
}

export interface QuizResultsData {
  score: number;
  moduleTitle: string;
  trainingLabel: string;
  completionDate: string;
  elapsedTime: string;
  questionCount: number;
  passingScore: number;
  answers: QuizAnswerResult[];
}
