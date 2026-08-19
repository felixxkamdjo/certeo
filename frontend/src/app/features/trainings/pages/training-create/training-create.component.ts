import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperComponent, StepItem } from '@shared/components/stepper/stepper';

@Component({
  selector: 'app-training-create',
  standalone: true,
  imports: [CommonModule, StepperComponent],
  templateUrl: './training-create.component.html',
  styleUrl: './training-create.component.scss'
})
export class TrainingCreateComponent {
  currentStep = 1;
  steps: StepItem[] = [
    { number: 1, title: 'Infos Générales', description: 'Titre & description' },
    { number: 2, title: 'Planification', description: 'Dates & lieu' },
    { number: 3, title: 'Communication', description: 'Cible & canaux' },
    { number: 4, title: 'Formulaire', description: 'Champs candidature' }
  ];
}
