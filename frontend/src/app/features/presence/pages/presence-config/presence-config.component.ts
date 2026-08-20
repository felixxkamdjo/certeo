import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-presence-config',
  standalone: true,
  templateUrl: './presence-config.component.html',
  styleUrl: './presence-config.component.scss',
})
export class PresenceConfigComponent {
  readonly saved = signal(false);
  readonly fields = signal([
    { label: 'Nom complet', required: true, enabled: true },
    { label: 'Adresse mail', required: true, enabled: true },
    { label: 'Téléphone', required: false, enabled: true },
    { label: 'Profil', required: false, enabled: true },
  ]);
  readonly reasons = signal(['Renseignements', 'Parcours découverte', 'Formation', 'Accès au coworking', 'Réunion']);

  toggleField(index: number): void { this.fields.update((fields) => fields.map((field, current) => current === index ? { ...field, enabled: !field.enabled } : field)); }
  addReason(): void { this.reasons.update((reasons) => [...reasons, 'Nouveau motif']); }
  save(): void { this.saved.set(true); }
}