import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DialogVariant = 'primary' | 'danger' | 'warning' | 'success' | 'info';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  @Input() variant: DialogVariant = 'primary';
  @Input() icon?: string;
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isLoading) {
      this.onCancel();
    }
  }

  get effectiveIcon(): string {
    if (this.icon) return this.icon;
    switch (this.variant) {
      case 'danger': return 'warning';
      case 'success': return 'check_circle';
      case 'warning': return 'report_problem';
      case 'info': return 'info';
      default: return 'help_outline';
    }
  }

  onConfirm(): void {
    if (!this.isLoading) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isLoading) {
      this.cancel.emit();
    }
  }
}
