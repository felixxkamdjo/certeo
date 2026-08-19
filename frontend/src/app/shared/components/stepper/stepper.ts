import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  number: number;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss'
})
export class StepperComponent {
  @Input({ required: true }) steps: StepItem[] = [];
  @Input() currentStep = 1;
  @Output() stepChange = new EventEmitter<number>();

  onStepClick(stepNumber: number): void {
    if (stepNumber <= this.currentStep) {
      this.stepChange.emit(stepNumber);
    }
  }
}
