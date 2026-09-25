import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge';
import {
  SystemSettings,
  DEFAULT_SETTINGS,
  TIMEZONE_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
} from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';

type SectionId = 'general' | 'notifications' | 'security' | 'integrations';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent, StatusBadgeComponent],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss',
})
export class SystemConfigComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb              = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private observer?: IntersectionObserver;

  // --- State ---
  readonly isSaving         = signal(false);
  readonly isSaved          = signal(false);
  readonly showSaveDialog   = signal(false);
  readonly showCancelDialog = signal(false);
  readonly activeSection    = signal<SectionId>('general');

  // --- Options ---
  readonly timezoneOptions       = TIMEZONE_OPTIONS;
  readonly sessionTimeoutOptions = SESSION_TIMEOUT_OPTIONS;

  readonly form = this.fb.nonNullable.group({
    // Notifications
    isNewApplicationAlertEnabled:   [DEFAULT_SETTINGS.isNewApplicationAlertEnabled],
    isTrainingReminderAlertEnabled: [DEFAULT_SETTINGS.isTrainingReminderAlertEnabled],
    isSystemUpdateAlertEnabled:     [DEFAULT_SETTINGS.isSystemUpdateAlertEnabled],
    // Sécurité
    sessionTimeoutMinutes:          [DEFAULT_SETTINGS.sessionTimeoutMinutes],
    minPasswordLength:              [DEFAULT_SETTINGS.minPasswordLength],
    isPasswordUppercaseRequired:    [DEFAULT_SETTINGS.isPasswordUppercaseRequired],
    isPasswordSpecialCharRequired:  [DEFAULT_SETTINGS.isPasswordSpecialCharRequired],
    passwordExpirationEnabled:      [DEFAULT_SETTINGS.passwordExpirationDays !== null],
    // Intégrations
    isLinkedInSharingAllowed:       [DEFAULT_SETTINGS.isLinkedInSharingAllowed],
    linkedInApiKey:                 [''],
    isOdcSyncActive:                [DEFAULT_SETTINGS.isOdcSyncActive],
  });

  readonly linkedInApiKeySet = signal(DEFAULT_SETTINGS.linkedInApiKeySet);
  readonly isOdcSyncActive   = signal(DEFAULT_SETTINGS.isOdcSyncActive);

  // --- Lifecycle ---

  ngOnInit(): void {
    this.settingsService.getConfig().subscribe(settings => {
      this.patchForm(settings);
      this.linkedInApiKeySet.set(settings.linkedInApiKeySet);
      this.isOdcSyncActive.set(settings.isOdcSyncActive);
    });
  }

  ngAfterViewInit(): void {
    this.initScrollSpy();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /**
   * Intersection Observer sur les 4 sections.
   * Quand une section entre dans le viewport (threshold 20%),
   * elle devient la section active dans la nav.
   */
  private initScrollSpy(): void {
    const sectionIds: SectionId[] = ['general', 'notifications', 'security', 'integrations'];

    this.observer = new IntersectionObserver(
      entries => {
        // On prend la section la plus haute visible dans le viewport
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          this.activeSection.set(visible[0].target.id as SectionId);
        }
      },
      {
        // rootMargin négatif en haut pour que la section s'active
        // quand elle approche du haut de la fenêtre
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.observer!.observe(el);
    });
  }

  private patchForm(s: SystemSettings): void {
    this.form.patchValue({
      isNewApplicationAlertEnabled:   s.isNewApplicationAlertEnabled,
      isTrainingReminderAlertEnabled: s.isTrainingReminderAlertEnabled,
      isSystemUpdateAlertEnabled:     s.isSystemUpdateAlertEnabled,
      sessionTimeoutMinutes:          s.sessionTimeoutMinutes,
      minPasswordLength:              s.minPasswordLength,
      isPasswordUppercaseRequired:    s.isPasswordUppercaseRequired,
      isPasswordSpecialCharRequired:  s.isPasswordSpecialCharRequired,
      passwordExpirationEnabled:      s.passwordExpirationDays !== null,
      isLinkedInSharingAllowed:       s.isLinkedInSharingAllowed,
      isOdcSyncActive:                s.isOdcSyncActive,
    });
  }

  // --- Navigation ---
  scrollTo(section: SectionId): void {
    this.activeSection.set(section);
    const el = document.getElementById(section);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Save ---
  promptSave(): void { this.showSaveDialog.set(true); }
  cancelSave(): void { this.showSaveDialog.set(false); }

  confirmSave(): void {
    this.showSaveDialog.set(false);
    this.isSaving.set(true);
    const val = this.form.getRawValue();

    const payload: Partial<SystemSettings> = {
      isNewApplicationAlertEnabled:   val.isNewApplicationAlertEnabled,
      isTrainingReminderAlertEnabled: val.isTrainingReminderAlertEnabled,
      isSystemUpdateAlertEnabled:     val.isSystemUpdateAlertEnabled,
      sessionTimeoutMinutes:          val.sessionTimeoutMinutes,
      minPasswordLength:              val.minPasswordLength,
      isPasswordUppercaseRequired:    val.isPasswordUppercaseRequired,
      isPasswordSpecialCharRequired:  val.isPasswordSpecialCharRequired,
      passwordExpirationDays:         val.passwordExpirationEnabled ? 90 : null,
      isLinkedInSharingAllowed:       val.isLinkedInSharingAllowed,
      isOdcSyncActive:                val.isOdcSyncActive,
    };

    this.settingsService.updateConfig(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isSaved.set(true);
        this.form.markAsPristine();
        setTimeout(() => this.isSaved.set(false), 3000);
      },
      error: () => this.isSaving.set(false),
    });
  }

  // --- Cancel ---
  promptCancel(): void {
    if (this.form.dirty) this.showCancelDialog.set(true);
  }

  confirmCancel(): void {
    this.showCancelDialog.set(false);
    this.ngOnInit();
    this.form.markAsPristine();
  }

  cancelDiscard(): void {
    this.showCancelDialog.set(false);
  }
}
