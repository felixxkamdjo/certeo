import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepperComponent, StepItem } from '@shared/components/stepper/stepper';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, StepperComponent],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.scss'
})
export class ApplicationFormComponent {
  currentStep = 1;
  steps: StepItem[] = [
    { number: 1, title: 'Infos' },
    { number: 2, title: 'Parcours' },
    { number: 3, title: 'Expérience' },
    { number: 4, title: 'Motivation' }
  ];
}
