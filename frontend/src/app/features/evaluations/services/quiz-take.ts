import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QuizTakeData } from '../models/quiz-take.model';

@Injectable({ providedIn: 'root' })
export class QuizTakeService {
  readonly data = httpResource<QuizTakeData>(() => '/assets/mocks/quiz-take.json');
}
