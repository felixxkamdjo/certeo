import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EvaluationsService } from '../../services/evaluations';

@Component({
  selector: 'app-quiz-send',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './quiz-send.component.html',
  styleUrl: './quiz-send.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizSendComponent {
  private readonly fb = inject(FormBuilder);
  private readonly evaluationsService = inject(EvaluationsService);

  readonly evaluations = this.evaluationsService.evaluations;

  // Formations déduites depuis les évaluations disponibles (mock — sera remplacé par TrainingService)
  readonly trainings = computed(() => {
    const seen = new Set<string>();
    return this.evaluations()
      .filter(e => {
        if (seen.has(e.trainingId)) return false;
        seen.add(e.trainingId);
        return true;
      })
      .map(e => ({ id: e.trainingId, name: e.trainingName }));
  });

  // Évaluations filtrées selon la formation sélectionnée
  readonly selectedTrainingId = signal('');
  readonly availableEvaluations = computed(() => {
    const tid = this.selectedTrainingId();
    if (!tid) return this.evaluations();
    return this.evaluations().filter(e => e.trainingId === tid);
  });

  readonly isSending = signal(false);
  readonly isSent = signal(false);

  readonly form = this.fb.group({
    trainingId: ['', Validators.required],
    evaluationId: ['', Validators.required],
    instructions: [''],
  });

  onTrainingChange(value: string): void {
    this.selectedTrainingId.set(value);
    this.form.patchValue({ evaluationId: '' });
  }

  send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    // Simule un appel API
    setTimeout(() => {
      this.isSending.set(false);
      this.isSent.set(true);
    }, 800);
  }

  reset(): void {
    this.form.reset();
    this.isSent.set(false);
    this.selectedTrainingId.set('');
  }
}
