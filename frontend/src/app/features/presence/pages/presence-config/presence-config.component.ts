import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FormField {
  label: string;
  required: boolean;
  enabled: boolean;
}

interface VisitReason {
  label: string;
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
  readonly fields = signal<FormField[]>([
    { label: 'Nom complet',    required: true,  enabled: true },
    { label: 'Adresse mail',   required: true,  enabled: true },
    { label: 'Téléphone',      required: false, enabled: true },
    { label: 'Sexe',           required: false, enabled: true },
    { label: 'Tranche d\'âge', required: false, enabled: true },
    { label: 'Profil',         required: false, enabled: true },
  ]);

  // Motifs de visite
  readonly reasons = signal<VisitReason[]>([
    { label: 'Renseignements' },
    { label: 'Parcours découverte' },
    { label: 'Formation' },
    { label: 'Accès au coworking' },
    { label: 'Réunion' },
    { label: 'Développement d\'un projet' },
  ]);

  // Tranches d'âge éditables
  readonly ageRanges = signal<string[]>(['-18 ans', '18-25', '26-35', '36-45', '45+']);

  // Profils visiteurs avec toggles
  readonly profiles = signal<{ label: string; enabled: boolean }[]>([
    { label: 'Étudiant',           enabled: true },
    { label: 'Salarié',            enabled: true },
    { label: 'Entrepreneur',       enabled: true },
    { label: 'Chercheur d\'emploi', enabled: true },
    { label: 'Retraité',           enabled: false },
  ]);

  toggleField(index: number): void {
    this.fields.update(fs => fs.map((f, i) =>
      i === index && !f.required ? { ...f, enabled: !f.enabled } : f
    ));
  }

  addReason(): void {
    this.reasons.update(r => [...r, { label: 'Nouveau motif' }]);
  }

  removeReason(index: number): void {
    this.reasons.update(r => r.filter((_, i) => i !== index));
  }

  updateReason(index: number, value: string): void {
    this.reasons.update(r => r.map((item, i) => i === index ? { ...item, label: value } : item));
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
