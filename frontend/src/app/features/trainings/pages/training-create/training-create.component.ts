import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StepperComponent, StepItem } from '@shared/components/stepper/stepper';
import { TrainingService } from '../../services/training.service';
import { TrainingStatus } from '../../models/training.model';

@Component({
  selector: 'app-training-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, StepperComponent],
  templateUrl: './training-create.component.html',
  styleUrl: './training-create.component.scss',
})
export class TrainingCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly trainingService = inject(TrainingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentStep = signal(1);
  isEditMode = signal(false);

  readonly steps: StepItem[] = [
    { number: 1, title: 'Informations', description: 'Titre & catégorie' },
    { number: 2, title: 'Planification', description: 'Dates & lieu' },
    { number: 3, title: 'Communication', description: 'Cible & réseaux' },
    { number: 4, title: 'Formulaire', description: 'Champs de candidature' },
  ];

  // 4-step wizard form group
  form = this.fb.group({
    // Step 1: Informations
    title: ['', [Validators.required]],
    category: ['Développement Logiciel', [Validators.required]],
    capacity: [30, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required]],

    // Step 2: Planification
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    mode: ['Physique' as 'Physique' | 'En ligne' | 'Hybride', [Validators.required]],

    // Step 3: Communication
    status: [TrainingStatus.Open, [Validators.required]],
    targetAudience: ['Étudiants, jeunes diplômés, reconversion professionnelle.'],
    socialPostText: ['🚀 Lancez votre carrière tech avec la formation CERTEO !'],

    // Step 4: Formulaire candidature (Champs Standards & Questions Personnalisées)
    requireLastName: [true],
    requireEmail: [true],
    requirePhone: [true],
    requirePortfolio: [false],
    requireCv: [true],
  });

  // Step 3 Image Upload preview signal
  readonly bannerPreview = signal<string | null>(null);

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

  // Step 4 Custom questions state & interactive creation
  readonly customQuestions = signal([
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

  // Inline question creator / editor form state
  readonly showQuestionForm = signal(false);
  editingQuestionId: number | null = null;
  newQuestionTitle = '';
  newQuestionType = 'Choix unique';
  newQuestionRequired = true;
  newQuestionOptionsText = '';

  openQuestionForm(): void {
    this.editingQuestionId = null;
    this.newQuestionTitle = '';
    this.newQuestionType = 'Choix unique';
    this.newQuestionRequired = true;
    this.newQuestionOptionsText = '';
    this.showQuestionForm.set(true);
  }

  editQuestion(q: { id: number; title: string; type: string; required: boolean; options: string[] }): void {
    this.editingQuestionId = q.id;
    this.newQuestionTitle = q.title;
    this.newQuestionType = q.type;
    this.newQuestionRequired = q.required;
    this.newQuestionOptionsText = q.options ? q.options.join(', ') : '';
    this.showQuestionForm.set(true);
  }

  cancelQuestionForm(): void {
    this.editingQuestionId = null;
    this.showQuestionForm.set(false);
  }

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

  removeCustomQuestion(id: number): void {
    this.customQuestions.update((list) => list.filter((q) => q.id !== id));
  }

  toggleQuestionRequired(id: number): void {
    this.customQuestions.update((list) =>
      list.map((q) => (q.id === id ? { ...q, required: !q.required } : q))
    );
  }

  ngOnInit(): void {
    const editId = this.route.snapshot.queryParamMap.get('editId');
    if (editId) {
      this.trainingService.getById(editId).subscribe((item) => {
        if (item) {
          this.isEditMode.set(true);
          this.form.patchValue({
            title: item.title,
            category: item.category,
            capacity: item.capacity,
            description: item.description,
            startDate: item.startDate,
            endDate: item.endDate,
            mode: item.mode,
            status: item.status,
            targetAudience: item.targetAudience,
            socialPostText: item.socialPostText,
          });
        }
      });
    }
  }

  setStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  submit(): void {
    if (this.form.valid) {
      const val = this.form.getRawValue();
      this.trainingService.create(val as any).subscribe(() => {
        this.router.navigate(['/admin/trainings']);
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}

