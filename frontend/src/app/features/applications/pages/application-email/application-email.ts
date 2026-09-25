import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

export type EmailType = 'personnel' | 'groupe';
export type RecipientStatus = 'TOUS' | 'SELECTED' | 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

@Component({
  selector: 'app-application-email',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './application-email.html',
  styleUrl: './application-email.scss'
})
export class ApplicationEmailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  // State
  readonly emailType = signal<EmailType>('personnel');
  readonly selectedStatus = signal<RecipientStatus[]>([ 'SELECTED' ]);
  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);

  // Available tags for the template
  readonly dynamicTags = [
    { label: 'Prénom', tag: '{{prenom}}' },
    { label: 'Nom', tag: '{{nom}}' },
    { label: 'Formation', tag: '{{formation}}' },
    { label: 'Date Entretien', tag: '{{date_entretien}}' },
    { label: 'Lieu', tag: '{{lieu}}' }
  ];

  // Templates
  readonly templates: EmailTemplate[] = [
    {
      id: 'convocation',
      name: 'Convocation à un entretien',
      subject: 'Convocation : Entretien pour la formation {{formation}}',
      body: 'Bonjour {{prenom}},\n\nNous avons le plaisir de vous informer que votre candidature pour la formation {{formation}} a été retenue pour la prochaine étape.\n\nNous vous invitons à un entretien technique le {{date_entretien}} à {{lieu}}.\n\nCordialement,\nL\'équipe Orange Digital Center'
    },
    {
      id: 'admission',
      name: 'Confirmation d\'admission',
      subject: 'Félicitations ! Vous êtes admis(e) à la formation {{formation}}',
      body: 'Bonjour {{prenom}} {{nom}},\n\nFélicitations ! Vous avez été sélectionné(e) pour participer à la formation {{formation}}.\n\nNous vous communiquerons très prochainement les détails de la rentrée.\n\nBienvenue chez ODC !'
    },
    {
      id: 'refus',
      name: 'Refus de candidature',
      subject: 'Suite à votre candidature : {{formation}}',
      body: 'Bonjour {{prenom}},\n\nNous vous remercions pour l\'intérêt que vous portez à Orange Digital Center.\n\nMalgré la qualité de votre profil, nous ne pouvons malheureusement pas donner une suite favorable à votre candidature pour la session actuelle.\n\nNous vous encourageons à postuler à nos futures cohortes.\n\nCordialement.'
    }
  ];

  readonly form: FormGroup = this.fb.group({
    searchQuery: [''],
    templateId: [''],
    subject: ['', [Validators.required]],
    body: ['', [Validators.required]],
    attachments: [null]
  });

  // Preview generated content
  readonly previewBody = computed(() => {
    let text = this.form.get('body')?.value || '';
    // Replace tags with mock data for preview
    text = text.replace(/{{prenom}}/g, 'Amira');
    text = text.replace(/{{nom}}/g, 'Diallo');
    text = text.replace(/{{formation}}/g, 'Développement Web');
    text = text.replace(/{{date_entretien}}/g, '25 Octobre à 10h00');
    text = text.replace(/{{lieu}}/g, 'Locaux ODC');
    
    // Replace newlines with <br> for HTML rendering
    return text.replace(/\n/g, '<br>');
  });

  ngOnInit(): void {
    // Check if we opened this from a specific candidate's page
    this.route.queryParams.subscribe(params => {
      if (params['candidateId']) {
        this.emailType.set('personnel');
        this.form.patchValue({ searchQuery: 'Amira Diallo (amira@example.com)' });
      }
    });
  }

  toggleEmailType(type: EmailType): void {
    this.emailType.set(type);
  }

  toggleStatus(status: RecipientStatus): void {
    const current = this.selectedStatus();
    if (status === 'TOUS') {
      this.selectedStatus.set(['TOUS']);
    } else {
      let updated = current.filter(s => s !== 'TOUS');
      if (updated.includes(status)) {
        updated = updated.filter(s => s !== status);
      } else {
        updated = [...updated, status];
      }
      this.selectedStatus.set(updated.length ? updated : ['SELECTED']);
    }
  }

  isStatusSelected(status: RecipientStatus): boolean {
    return this.selectedStatus().includes(status);
  }

  onTemplateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const templateId = select.value;
    const tpl = this.templates.find(t => t.id === templateId);
    
    if (tpl) {
      this.form.patchValue({
        subject: tpl.subject,
        body: tpl.body
      });
    }
  }

  insertTag(tag: string): void {
    const bodyControl = this.form.get('body');
    if (bodyControl) {
      const currentVal = bodyControl.value || '';
      bodyControl.setValue(currentVal + tag);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.form.patchValue({ attachments: input.files[0] });
    }
  }

  goBack(): void {
    this.location.back();
  }

  sendEmail(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        this.goBack();
      }, 2000);
    }, 1500);
  }
}
