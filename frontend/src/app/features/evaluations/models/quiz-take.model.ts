export interface QuizQuestion {
  title: string;
  options: string[];
  answer: number;
}

export interface QuizTakeData {
  questions: QuizQuestion[];
  initialQuestionIndex: number;
  duration: string;
}
