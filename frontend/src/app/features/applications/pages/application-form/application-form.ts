import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export interface StepConfig {
  number: number;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss'
})
export class ApplicationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly currentStep = signal<number>(1);
  readonly isSubmitting = signal<boolean>(false);
  readonly isSubmitted = signal<boolean>(false);
  readonly applicationId = signal<string>('');
  readonly selectedFileName = signal<string>('');

  // Formation cible (optionnelle via query params ou route)
  readonly selectedTrainingTitle = signal<string>('Développement Web Fullstack');

  readonly steps: StepConfig[] = [
    { number: 1, title: 'Informations Personnelles', subtitle: 'Vos coordonnées de contact', icon: 'person' },
    { number: 2, title: 'Parcours Académique', subtitle: 'Vos études et diplômes', icon: 'school' },
    { number: 3, title: 'Expérience & Compétences', subtitle: 'Votre niveau et portfolio', icon: 'work' },
    { number: 4, title: 'Motivation & Disponibilités', subtitle: 'Vos attentes et engagement', icon: 'favorite' }
  ];

  // FormGroup pour chaque étape
  readonly step1Form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{8,15}$/)]],
    city: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    ageGroup: ['', [Validators.required]]
  });

  readonly step2Form: FormGroup = this.fb.group({
    educationLevel: ['', [Validators.required]],
    fieldOfStudy: ['', [Validators.required]],
    institution: ['', [Validators.required]],
    graduationYear: ['', [Validators.required, Validators.min(1990), Validators.max(2030)]]
  });

  readonly step3Form: FormGroup = this.fb.group({
    currentStatus: ['', [Validators.required]],
    techLevel: ['', [Validators.required]],
    portfolioUrl: ['', [Validators.pattern(/https?:\/\/.+/)]],
    githubUrl: ['', [Validators.pattern(/https?:\/\/.+/)]],
    cvFile: ['']
  });

  readonly step4Form: FormGroup = this.fb.group({
    motivation: ['', [Validators.required, Validators.minLength(50)]],
    availability: ['', [Validators.required]],
    referralSource: ['', [Validators.required]],
    termsAccepted: [false, [Validators.requiredTrue]]
  });

  readonly activeStepConfig = computed(() => {
    return this.steps.find(s => s.number === this.currentStep()) || this.steps[0];
  });

  readonly progressPercentage = computed(() => {
    return (this.currentStep() / this.steps.length) * 100;
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['training']) {
        this.selectedTrainingTitle.set(params['training']);
      }
    });
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: return this.step1Form.valid;
      case 2: return this.step2Form.valid;
      case 3: return this.step3Form.valid;
      case 4: return this.step4Form.valid;
      default: return false;
    }
  }

  nextStep(): void {
    const step = this.currentStep();
    const currentForm = this.getFormForStep(step);
    
    if (currentForm.invalid) {
      currentForm.markAllAsTouched();
      return;
    }

    if (step < this.steps.length) {
      this.currentStep.set(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(stepNumber: number): void {
    // Permet de revenir en arrière ou d'aller à une étape si les précédentes sont valides
    if (stepNumber < this.currentStep()) {
      this.currentStep.set(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName.set(file.name);
      this.step3Form.patchValue({ cvFile: file.name });
    }
  }

  removeFile(): void {
    this.selectedFileName.set('');
    this.step3Form.patchValue({ cvFile: '' });
  }

  onSubmit(): void {
    if (this.step4Form.invalid) {
      this.step4Form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulation d'envoi réseau
    setTimeout(() => {
      const generatedId = 'CAN-' + Math.floor(100000 + Math.random() * 900000);
      this.applicationId.set(generatedId);
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  restartApplication(): void {
    this.step1Form.reset();
    this.step2Form.reset();
    this.step3Form.reset();
    this.step4Form.reset();
    this.selectedFileName.set('');
    this.currentStep.set(1);
    this.isSubmitted.set(false);
    this.applicationId.set('');
  }

  private getFormForStep(step: number): FormGroup {
    switch (step) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.step3Form;
      case 4: return this.step4Form;
      default: return this.step1Form;
    }
  }

  // Helpers pour les erreurs de validation
  hasError(form: FormGroup, controlName: string, errorName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }
}
