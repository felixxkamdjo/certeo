import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyStateComponent {
  @Input() title = 'Aucune donnee';
  @Input() description = 'Il n\'y a aucun element a afficher pour le moment.';
  /** Nom d'icone Material Symbols. Si absent, affiche l'icone SVG par defaut. */
  @Input() icon?: string;
}
