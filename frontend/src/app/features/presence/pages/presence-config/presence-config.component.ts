import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DEFAULT_PRESENCE_CONFIG, VisitReasonConfig, ProfileConfig } from '../../models/presence.model';

interface FormField {
  label: string;
  controlName: string;
  required: boolean;
  enabled: boolean;
}

@Component({
  selector: 'app-presence-config',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './presence-config.component.html',
  styleUrl: './presence-config.component.scss',
})
export class PresenceConfigComponent {
  readonly saved = signal(false);

  // Champs du formulaire étape 1
  readonly fields = signal<FormField[]>([...DEFAULT_PRESENCE_CONFIG.fields]);

  // Motifs de visite
  readonly reasons = signal<VisitReasonConfig[]>([...DEFAULT_PRESENCE_CONFIG.reasons]);

  // Tranches d'âge éditables
  readonly ageRanges = signal<string[]>([...DEFAULT_PRESENCE_CONFIG.ageRanges]);

  // Profils visiteurs avec toggles
  readonly profiles = signal<ProfileConfig[]>([...DEFAULT_PRESENCE_CONFIG.profiles]);

  toggleField(index: number): void {
    this.fields.update(fs => fs.map((f, i) =>
      i === index && !f.required ? { ...f, enabled: !f.enabled } : f
    ));
  }

  addReason(): void {
    const newReason: VisitReasonConfig = {
      value: 'Nouveau motif',
      label: 'Nouveau motif',
      icon: 'star',
      questionType: 'direct_confirm',
      questionTitle: 'Validation',
      questionSubtitle: 'Confirmez votre arrivée.'
    };
    this.reasons.update(r => [...r, newReason]);
  }

  removeReason(index: number): void {
    this.reasons.update(r => r.filter((_, i) => i !== index));
  }

  updateReason(index: number, value: string): void {
    this.reasons.update(r => r.map((item, i) => i === index ? { ...item, label: value, value } : item));
  }

  addAgeRange(): void {
    this.ageRanges.update(a => [...a, '']);
  }

  removeAgeRange(index: number): void {
    this.ageRanges.update(a => a.filter((_, i) => i !== index));
  }

  toggleProfile(index: number): void {
    this.profiles.update(ps => ps.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p
    ));
  }

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
