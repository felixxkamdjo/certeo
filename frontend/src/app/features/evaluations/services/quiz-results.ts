import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QuizResultsData } from '../models/quiz-results.model';

@Injectable({ providedIn: 'root' })
export class QuizResultsService {
  readonly data = httpResource<QuizResultsData>(() => '/mocks/quiz-results.json');
}
