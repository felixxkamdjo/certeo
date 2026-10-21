import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  templateUrl: './presence-config.component.html',
  styleUrl: './presence-config.component.scss',
})
export class PresenceConfigComponent {
  readonly saved = signal(false);

  // Manage personal information fields configuration
  readonly fields = signal<FormField[]>([...DEFAULT_PRESENCE_CONFIG.fields]);

  // Manage visit reason reference categories
  readonly reasons = signal<VisitReasonConfig[]>([...DEFAULT_PRESENCE_CONFIG.reasons]);

  // Manage customizable visitor age ranges
  readonly ageRanges = signal<string[]>([...DEFAULT_PRESENCE_CONFIG.ageRanges]);

  // Manage visitor profile category toggles
  readonly profiles = signal<ProfileConfig[]>([...DEFAULT_PRESENCE_CONFIG.profiles]);

  // Toggle field visibility state when not required
  toggleField(index: number): void {
    this.fields.update(fs => fs.map((f, i) =>
      i === index && !f.required ? { ...f, enabled: !f.enabled } : f
    ));
  }

  // Append new visit reason item to configuration
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

  // Remove visit reason item by index
  removeReason(index: number): void {
    this.reasons.update(r => r.filter((_, i) => i !== index));
  }

  // Update visit reason label value
  updateReason(index: number, value: string): void {
    this.reasons.update(r => r.map((item, i) => i === index ? { ...item, label: value, value } : item));
  }

  // Append empty age range entry
  addAgeRange(): void {
    this.ageRanges.update(a => [...a, '']);
  }

  // Delete age range entry by index
  removeAgeRange(index: number): void {
    this.ageRanges.update(a => a.filter((_, i) => i !== index));
  }

  // Toggle visitor profile enabled state
  toggleProfile(index: number): void {
    this.profiles.update(ps => ps.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p
    ));
  }

  // Persist form configuration changes
  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
