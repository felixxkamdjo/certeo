import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '@features/trainings/services/training.service';
import { PresenceCheckInDto, DEFAULT_PRESENCE_CONFIG, VisitReasonConfig, ProfileConfig } from '../../models/presence.model';
import { GeolocationService } from '../../services/geolocation.service';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-presence-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './presence-form.component.html',
  styleUrl: './presence-form.component.scss'
})
export class PresenceFormComponent {
  private readonly formBuilder     = inject(FormBuilder);
  private readonly route           = inject(ActivatedRoute);
  private readonly presenceService = inject(PresenceService);
  readonly trainingService         = inject(TrainingService);
  readonly geolocation             = inject(GeolocationService);

  readonly step      = signal(1);
  readonly submitted = signal(false);
  readonly error     = signal<string | null>(null);
  readonly token     = this.route.snapshot.queryParamMap.get('token') ?? undefined;

  /** Indique si on est en mode dev local */
  readonly isDevMode = typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // --- Source unique de vérité (depuis models) ---
  readonly profileOptions: ProfileConfig[] = DEFAULT_PRESENCE_CONFIG.profiles.filter(p => p.enabled);
  readonly ageRangeOptions: string[] = DEFAULT_PRESENCE_CONFIG.ageRanges;
  readonly reasonOptions: VisitReasonConfig[] = DEFAULT_PRESENCE_CONFIG.reasons;

  readonly form = this.formBuilder.nonNullable.group({
    visitorName: ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phone:       ['', Validators.required],
    gender:      ['', Validators.required],
    ageRange:    ['', Validators.required],
    profile:     ['', Validators.required],
    visitReason: ['Formation', Validators.required],
    // Champs conditionnels étape 2
    trainingId:  [''],
    startupName: [''],
    teamSize:    [''],
    details:     [''],
  });

  private readonly visitReasonSignal = toSignal(this.form.controls.visitReason.valueChanges, { initialValue: this.form.controls.visitReason.value });

  readonly currentReasonConfig = computed<VisitReasonConfig>(() => {
    const currentReason = this.visitReasonSignal();
    return this.reasonOptions.find(r => r.value === currentReason) ?? this.reasonOptions[0];
  });

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  constructor() {
    this.trainingService.getAll().subscribe();

    // Lance la vérification GPS automatiquement dès que le composant est rendu
    afterNextRender(() => {
      this.begin();
    });
  }

  async begin(): Promise<void> {
    this.error.set(null);
    const allowed = await this.geolocation.checkLocation();
    if (allowed) this.step.set(1);
    else this.error.set(this.geolocation.errorMessage());
  }

  next(): void {
    const personalControls = ['visitorName', 'email', 'phone', 'gender', 'ageRange', 'profile', 'visitReason'];
    personalControls.forEach((control) => this.form.controls[control as keyof typeof this.form.controls].markAsTouched());
    if (personalControls.some((control) => this.form.controls[control as keyof typeof this.form.controls].invalid)) return;

    this.applyStep2Validation();
    this.step.set(2);
  }

  back(): void {
    this.step.set(1);
  }

  private applyStep2Validation(): void {
    const qType = this.currentReasonConfig().questionType;

    // Reset validations
    this.form.controls.trainingId.clearValidators();
    this.form.controls.startupName.clearValidators();
    this.form.controls.teamSize.clearValidators();
    this.form.controls.details.clearValidators();

    if (qType === 'coworking') {
      this.form.controls.startupName.setValidators([Validators.required]);
      this.form.controls.teamSize.setValidators([Validators.required]);
    } else if (qType === 'text_question') {
      this.form.controls.details.setValidators([Validators.required]);
    }

    this.form.controls.trainingId.updateValueAndValidity();
    this.form.controls.startupName.updateValueAndValidity();
    this.form.controls.teamSize.updateValueAndValidity();
    this.form.controls.details.updateValueAndValidity();
  }

  submit(): void {
    this.applyStep2Validation();
    const qType = this.currentReasonConfig().questionType;

    if (qType === 'training') {
      this.form.controls.trainingId.markAsTouched();
    } else if (qType === 'coworking') {
      this.form.controls.startupName.markAsTouched();
      this.form.controls.teamSize.markAsTouched();
    } else if (qType === 'text_question') {
      this.form.controls.details.markAsTouched();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const coords = this.geolocation.userCoords();
    const formVal = this.form.getRawValue();

    const dto: PresenceCheckInDto = {
      ...formVal,
      token: this.token,
      latitude: coords?.latitude,
      longitude: coords?.longitude
    };

    if (this.isDevMode) {
      setTimeout(() => this.submitted.set(true), 500);
      return;
    }

    this.presenceService.registerPresence(dto).subscribe({
      next: () => this.submitted.set(true),
      error: () => this.error.set("L'enregistrement n'a pas pu être validé. Vérifiez le QR code et votre position."),
    });
  }

  forceSuccess(): void {
    this.submitted.set(true);
  }

  restart(): void {
    this.submitted.set(false);
    this.step.set(1);
    this.form.reset({
      visitorName: '',
      email: '',
      phone: '',
      gender: '',
      ageRange: '',
      profile: '',
      visitReason: 'Formation',
      trainingId: '',
      startupName: '',
      teamSize: '',
      details: ''
    });
  }
}
