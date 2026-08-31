export interface Quiz {
  id: string;
  trainingId: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  candidateName: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  completedAt: string;
}
