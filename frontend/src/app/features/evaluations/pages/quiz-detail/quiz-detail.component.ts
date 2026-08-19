import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { EvaluationsService } from '../../services/evaluations';

interface PreviewQuestion {
  title: string;
  options: string[];
  answer: number;
}

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-detail.component.html',
  styleUrl: './quiz-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluationsService = inject(EvaluationsService);

  readonly evaluation = computed(() => {
    const evaluationId = this.route.snapshot.paramMap.get('id');
    return this.evaluationsService.evaluations().find(item => item.id === evaluationId);
  });

  readonly questions: readonly PreviewQuestion[] = [
    {
      title: "Quelle balise HTML est utilisée pour définir le titre principal d'une page ?",
      options: ['<header>', '<h1>', '<title>', '<head>'],
      answer: 1,
    },
    {
      title: 'Quelle propriété CSS permet de modifier la couleur du texte ?',
      options: ['background', 'font-style', 'color', 'text-align'],
      answer: 2,
    },
    {
      title: 'Quel mot-clé permet de déclarer une constante en JavaScript moderne ?',
      options: ['var', 'let', 'const', 'static'],
      answer: 2,
    },
  ];

  readonly completionLabel = computed(() => {
    const questionCount = this.evaluation()?.questionCount ?? this.questions.length;
    return questionCount > this.questions.length ? `+ ${questionCount - this.questions.length} autres questions` : '';
  });

  formatDate(date: string | undefined): string {
    if (!date) {
      return 'Date inconnue';
    }

    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
  }
}
