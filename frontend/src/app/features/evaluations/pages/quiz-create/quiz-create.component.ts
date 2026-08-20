import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EvaluationsService } from '../../services/evaluations';

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './quiz-create.component.html',
  styleUrl: './quiz-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizCreateComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly evaluationsService = inject(EvaluationsService);

  readonly evaluationId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = computed(() => this.evaluationId !== null);

  readonly saved = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    title: ['QCM Final - Développement Web', Validators.required],
    trainingName: ['Bootcamp Développement Web Fullstack', Validators.required],
    description: [''],
    duration: [30, [Validators.required, Validators.min(1)]],
    shuffleQuestions: [true],
    shuffleOptions: [true],
    questions: this.formBuilder.array([this.createQuestion()]),
  });

  constructor() {
    effect(() => {
      const evaluation = this.evaluationsService.findById(this.evaluationId);
      if (!evaluation) {
        return;
      }

      this.form.patchValue({
        title: evaluation.title,
        trainingName: evaluation.trainingName,
      });

      this.questions.at(0).patchValue({
        question: "Quelle balise HTML est utilisée pour définir le titre principal d'une page ?",
        correctOption: 1,
        points: 1,
      });
      this.optionsFor(0).patchValue(['<header>', '<h1>', '<title>', '<head>']);
    });
  }

  readonly totalPoints = computed(() =>
    this.questions.controls.reduce((total, question) => total + Number(question.get('points')?.value ?? 0), 0),
  );

  get questions(): FormArray<FormGroup> {
    return this.form.controls.questions as FormArray<FormGroup>;
  }

  optionsFor(questionIndex: number): FormArray<FormControl<string>> {
    return this.questions.at(questionIndex).get('options') as FormArray<FormControl<string>>;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(questionIndex: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(questionIndex);
    }
  }

  addOption(questionIndex: number): void {
    this.optionsFor(questionIndex).push(this.formBuilder.nonNullable.control(''));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.optionsFor(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
    }
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.saved.set(false);
      return;
    }

    this.saved.set(true);
  }

  private createQuestion() {
    return this.formBuilder.nonNullable.group({
      question: ["Quelle balise HTML est utilisée pour définir le titre principal d'une page ?", Validators.required],
      options: this.formBuilder.array([
        this.formBuilder.control(''),
        this.formBuilder.control(''),
        this.formBuilder.control(''),
        this.formBuilder.control(''),
      ]),
      correctOption: [1, Validators.required],
      points: [1, [Validators.required, Validators.min(1)]],
    });
  }
}
