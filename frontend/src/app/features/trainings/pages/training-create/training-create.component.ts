import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StepperComponent, StepItem } from '@shared/components/stepper/stepper';
import { TrainingService } from '../../services/training.service';
import {
  TrainingStatus,
  TrainingMode,
  CreateTrainingRequest
} from '../../models/training.model';

@Component({
  selector: 'app-training-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, StepperComponent],
  templateUrl: './training-create.component.html',
  styleUrl: './training-create.component.scss',
})
export class TrainingCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly trainingService = inject(TrainingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly TrainingMode = TrainingMode;
  readonly TrainingStatus = TrainingStatus;

  readonly currentStep = signal(1);
  readonly isEditMode = signal(false);
  readonly isSubmitting = signal(false);
  readonly editId = signal<string | null>(null);

  readonly steps: StepItem[] = [
    { number: 1, title: 'Informations', description: 'Titre & catégorie' },
    { number: 2, title: 'Planification', description: 'Dates & lieu' },
    { number: 3, title: 'Communication', description: 'Cible & réseaux' },
    { number: 4, title: 'Formulaire', description: 'Champs de candidature' },
  ];

  // Initialize multi-step reactive form
  readonly form = this.fb.group({
    // Capture basic training details
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Développement Web', [Validators.required]],
    capacity: [30, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required]],

    // Schedule dates and session format
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    mode: ['Physique' as 'Physique' | 'En ligne' | 'Hybride', [Validators.required]],

    // Define communication and visibility settings
    status: [TrainingStatus.Open, [Validators.required]],
    targetAudience: ['Étudiants, jeunes diplômés, reconversion professionnelle.'],
    socialPostText: ['🚀 Lancez votre carrière tech avec la formation CERTEO !'],

    // Configure required candidate fields
    requireLastName: [true],
    requireEmail: [true],
    requirePhone: [true],
    requirePortfolio: [false],
    requireCv: [true],
  });

  // Track banner preview image URL
  readonly bannerPreview = signal<string | null>(null);

  // Read selected image file as data URL
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Manage custom registration questions list
  readonly customQuestions = signal<Array<{
    id: number;
    title: string;
    type: string;
    required: boolean;
    options: string[];
  }>>([
    {
      id: 1,
      title: 'Avez-vous un ordinateur personnel ?',
      type: 'Choix unique',
      required: true,
      options: ['Oui', 'Non'],
    },
    {
      id: 2,
      title: 'Décrivez brièvement votre motivation pour cette formation.',
      type: 'Texte long',
      required: true,
      options: [],
    },
    {
      id: 3,
      title: 'Quelles sont vos disponibilités hebdomadaires ?',
      type: 'Choix multiple',
      required: false,
      options: ['Temps plein', 'Temps partiel', 'Soirées'],
    },
  ]);

  // Manage question modal form state
  readonly showQuestionForm = signal(false);
  editingQuestionId: number | null = null;
  newQuestionTitle = '';
  newQuestionType = 'Choix unique';
  newQuestionRequired = true;
  newQuestionOptionsText = '';

  constructor() {
    // Load existing training data on edit mode
    const id = this.route.snapshot.queryParamMap.get('editId');
    if (id) {
      this.editId.set(id);
      this.isEditMode.set(true);
      this.trainingService.getById(id).subscribe({
        next: (item) => {
          if (!item) return;

          const modeString: 'Physique' | 'En ligne' | 'Hybride' =
            item.mode === TrainingMode.Online
              ? 'En ligne'
              : item.mode === TrainingMode.Hybrid
              ? 'Hybride'
              : 'Physique';

          this.form.patchValue({
            title: item.title,
            category: item.categoryLabel || 'Développement Web',
            capacity: item.maxCapacity,
            description: item.description,
            startDate: item.startDate,
            endDate: item.endDate,
            mode: modeString,
            status: item.status,
            targetAudience: item.targetAudience ?? '',
            socialPostText: item.socialMediaMessage ?? '',
          });

          if (item.imageUrl) {
            this.bannerPreview.set(item.imageUrl);
          }
        },
      });
    }
  }

  // Open modal to add a new question
  openQuestionForm(): void {
    this.editingQuestionId = null;
    this.newQuestionTitle = '';
    this.newQuestionType = 'Choix unique';
    this.newQuestionRequired = true;
    this.newQuestionOptionsText = '';
    this.showQuestionForm.set(true);
  }

  // Populate modal with selected question data for editing
  editQuestion(q: { id: number; title: string; type: string; required: boolean; options: string[] }): void {
    this.editingQuestionId = q.id;
    this.newQuestionTitle = q.title;
    this.newQuestionType = q.type;
    this.newQuestionRequired = q.required;
    this.newQuestionOptionsText = q.options ? q.options.join(', ') : '';
    this.showQuestionForm.set(true);
  }

  // Reset and close question modal
  cancelQuestionForm(): void {
    this.editingQuestionId = null;
    this.showQuestionForm.set(false);
  }

  // Persist question changes or append a new entry
  saveCustomQuestion(): void {
    if (!this.newQuestionTitle.trim()) return;

    const options = this.newQuestionOptionsText
      ? this.newQuestionOptionsText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (this.editingQuestionId) {
      const editId = this.editingQuestionId;
      this.customQuestions.update((list) =>
        list.map((q) =>
          q.id === editId
            ? {
                ...q,
                title: this.newQuestionTitle.trim(),
                type: this.newQuestionType,
                required: this.newQuestionRequired,
                options,
              }
            : q
        )
      );
    } else {
      const newQ = {
        id: Date.now(),
        title: this.newQuestionTitle.trim(),
        type: this.newQuestionType,
        required: this.newQuestionRequired,
        options,
      };
      this.customQuestions.update((list) => [...list, newQ]);
    }

    this.showQuestionForm.set(false);
    this.editingQuestionId = null;
  }

  // Remove question by ID from the list
  removeCustomQuestion(id: number): void {
    this.customQuestions.update((list) => list.filter((q) => q.id !== id));
  }

  // Invert mandatory requirement flag for a question
  toggleQuestionRequired(id: number): void {
    this.customQuestions.update((list) =>
      list.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
    );
  }

  // Jump to specific step number
  setStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.currentStep.set(step);
    }
  }

  // Advance to next wizard step
  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update((s) => s + 1);
    }
  }

  // Return to previous wizard step
  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  // Delegate submission call
  submit(): void {
    this.onSubmit();
  }

  // Validate form and submit creation payload
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.form.getRawValue();

    // Map string mode to numeric backend enum
    const numericMode: TrainingMode =
      val.mode === 'En ligne'
        ? TrainingMode.Online
        : val.mode === 'Hybride'
        ? TrainingMode.Hybrid
        : TrainingMode.InPerson;

    // Calculate default application deadline one week before start date
    let deadline = val.startDate!;
    try {
      const start = new Date(val.startDate!);
      start.setDate(start.getDate() - 7);
      deadline = start.toISOString().split('T')[0];
    } catch {}

    const payload: CreateTrainingRequest = {
      title: val.title!,
      description: val.description!,
      categoryId: '51dee000-48c7-4533-980a-2ad5bb205f51', // Default category ID
      startDate: val.startDate!,
      endDate: val.endDate!,
      applicationDeadline: deadline,
      location: 'Douala',
      mode: numericMode,
      maxCapacity: Number(val.capacity) || 30,
      minCapacity: 10,
      targetAudience: val.targetAudience ?? undefined,
      isQuizMandatory: false,
      isCertificateEnabled: true,
      publishImmediately: val.status === TrainingStatus.Open,
      customQuestions: this.customQuestions().map((q, idx) => ({
        label: q.title,
        type: q.type,
        isRequired: q.required,
        options: q.options,
      })),
    };

    this.trainingService.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/trainings']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
