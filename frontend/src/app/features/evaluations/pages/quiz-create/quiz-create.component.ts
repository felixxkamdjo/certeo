import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { EvaluationsService } from '../../services/evaluations';

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './quiz-create.component.html',
  styleUrl: './quiz-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluationsService = inject(EvaluationsService);

  readonly evaluationId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = computed(() => this.evaluationId !== null);
  readonly saved = signal(false);

  // --- Formations dédupliquées depuis le service (dynamiques) ---
  readonly trainings = computed(() => {
    const seen = new Set<string>();
    return this.evaluationsService.evaluations()
      .filter(e => {
        if (seen.has(e.trainingId)) return false;
        seen.add(e.trainingId);
        return true;
      })
      .map(e => ({ id: e.trainingId, name: e.trainingName }));
  });

  readonly form = this.fb.nonNullable.group({
    title:            ['', Validators.required],
    trainingId:       ['', Validators.required],
    description:      [''],
    duration:         [30, [Validators.required, Validators.min(1)]],
    shuffleQuestions: [true],
    shuffleOptions:   [true],
    questions:        this.fb.array([this.createQuestion()]),
  });

  // Bridge RxJS → Signal pour le total des points réactif
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.value))
  );

  readonly totalPoints = computed(() => {
    const val = this.formValue();
    if (!val?.['questions']) return 0;
    return (val['questions'] as any[]).reduce(
      (sum: number, q: any) => sum + (Number(q?.['points']) || 0), 0
    );
  });

  constructor() {
    effect(() => {
      const evaluation = this.evaluationsService.findById(this.evaluationId);
      if (!evaluation) return;
      this.form.patchValue({
        title:       evaluation.title,
        trainingId:  evaluation.trainingId,
        description: evaluation.description ?? '',
        duration:    evaluation.duration ?? 30,
      });
    });
  }

  // --- Helpers de validation pour le template ---
  isInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && control.touched;
  }

  getError(control: AbstractControl | null, error: string): boolean {
    return !!control && control.hasError(error) && control.touched;
  }

  isQuestionInvalid(qi: number): boolean {
    return this.isInvalid(this.questions.at(qi).get('question'));
  }

  // --- Accesseurs ---
  get questions(): FormArray<FormGroup> {
    return this.form.controls['questions'] as FormArray<FormGroup>;
  }

  optionsFor(qi: number): FormArray<FormControl<string>> {
    return this.questions.at(qi).get('options') as FormArray<FormControl<string>>;
  }

  correctOptionControlFor(qi: number): FormControl<number> {
    return this.questions.at(qi).get('correctOption') as FormControl<number>;
  }

  // --- Mutations questions ---
  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  duplicateQuestion(qi: number): void {
    const src = this.questions.at(qi).getRawValue();
    const dup = this.createQuestion();
    dup.patchValue({
      question:      src['question'],
      correctOption: src['correctOption'],
      points:        src['points'],
    });
    const optArr = dup.get('options') as FormArray;
    optArr.clear();
    (src['options'] as string[]).forEach(o =>
      optArr.push(this.fb.nonNullable.control(o))
    );
    this.questions.insert(qi + 1, dup);
  }

  removeQuestion(qi: number): void {
    if (this.questions.length > 1) this.questions.removeAt(qi);
  }

  // --- Mutations options ---
  addOption(qi: number): void {
    this.optionsFor(qi).push(this.fb.nonNullable.control(''));
  }

  removeOption(qi: number, oi: number): void {
    const opts = this.optionsFor(qi);
    if (opts.length <= 2) return;
    opts.removeAt(oi);
    const correct = this.correctOptionControlFor(qi);
    if (correct.value >= opts.length) correct.setValue(0);
  }

  // --- Actions ---
  preview(): void {
    this.router.navigate(['/public/quiz/take']);
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.saved.set(false);
      return;
    }
    this.saved.set(true);
  }

  // --- Factory ---
  private createQuestion(): FormGroup {
    return this.fb.nonNullable.group({
      question:      ['', Validators.required],
      options:       this.fb.array([
        this.fb.nonNullable.control(''),
        this.fb.nonNullable.control(''),
        this.fb.nonNullable.control(''),
        this.fb.nonNullable.control(''),
      ]),
      correctOption: [0, Validators.required],
      points:        [1, [Validators.required, Validators.min(1)]],
    });
  }
}

