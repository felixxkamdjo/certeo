import { CommonModule } from '@angular/common';
import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '@features/trainings/services/training.service';
import { PresenceCheckInDto } from '../../models/presence.model';
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
  private readonly formBuilder    = inject(FormBuilder);
  private readonly route          = inject(ActivatedRoute);
  private readonly presenceService= inject(PresenceService);
  readonly trainingService        = inject(TrainingService);
  readonly geolocation            = inject(GeolocationService);

  readonly step      = signal(1);
  readonly submitted = signal(false);
  readonly error     = signal<string | null>(null);
  readonly token     = this.route.snapshot.queryParamMap.get('token') ?? undefined;

  /** Indique si on est en mode test géo (?geo=test dans l'URL) */
  readonly isGeoTestMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('geo') === 'test';

  readonly profileOptions = [
    { value: 'Étudiant',            label: 'Étudiant',           icon: 'school'         },
    { value: 'Salarié',             label: 'Salarié',            icon: 'work'           },
    { value: 'Entrepreneur',        label: 'Entrepreneur',       icon: 'rocket_launch'  },
    { value: "Chercheur d'emploi",  label: "Chercheur d'emploi", icon: 'search'         },
    { value: 'Retraité',            label: 'Retraité',           icon: 'elderly'        },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    visitorName: ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phone:       [''],
    gender:      [''],
    ageRange:    ['18-25'],
    profile:     ['Étudiant'],
    visitReason: ['Formation', Validators.required],
    trainingId:  [''],
  });

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
    this.step.set(2);
  }

  back(): void { this.step.set(1); }

  submit(): void {
    this.form.controls.trainingId.markAsTouched();
    if (this.form.invalid) return;
    const coords = this.geolocation.userCoords();
    const dto: PresenceCheckInDto = { ...this.form.getRawValue(), token: this.token, latitude: coords?.latitude, longitude: coords?.longitude };
    this.presenceService.registerPresence(dto).subscribe({
      next: () => this.submitted.set(true),
      error: () => this.error.set("L'enregistrement n'a pas pu être validé. Vérifiez le QR code et votre position."),
    });
  }

  restart(): void { this.submitted.set(false); this.step.set(1); this.form.reset({ visitorName: '', email: '', phone: '', gender: '', ageRange: '18-25', profile: 'Étudiant', visitReason: 'Formation', trainingId: '' }); }
}
