import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TrainingService } from '../../services/training.service';
import { Training } from '../../models/training.model';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './training-detail.component.html',
  styleUrl: './training-detail.component.scss',
})
export class TrainingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly trainingService = inject(TrainingService);

  readonly training = signal<Training | undefined>(undefined);
  readonly copied = signal(false);

  readonly mockApplicants = signal([
    { name: 'Alice Dupont', email: 'alice.dupont@email.com', date: '01 Sept 2024', status: 'Confirmé' },
    { name: 'Marc Lemaire', email: 'm.lemaire@email.com', date: '02 Sept 2024', status: 'Confirmé' },
    { name: 'Sarah Connor', email: 's.connor@email.com', date: '03 Sept 2024', status: 'En attente' },
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'tr-1';
    this.trainingService.getById(id).subscribe((data) => {
      this.training.set(data);
    });
  }

  copyLink(): void {
    const link = this.training()?.publicLink || 'https://certeo.orange.com/apply/dev-fs-24';
    navigator.clipboard.writeText(link);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

