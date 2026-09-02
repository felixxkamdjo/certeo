import { Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="action-bar">
      <div class="action-bar__left">
        @if (showSearch()) {
          <div class="search-input">
            <span class="material-symbols-outlined search-input__icon">search</span>
            <input
              class="search-input__field"
              type="text"
              [placeholder]="searchPlaceholder()"
              [ngModel]="searchValue()"
              (ngModelChange)="onSearch($event)"
            />
          </div>
        }
        <ng-content select="[filters]"></ng-content>
      </div>
      <div class="action-bar__right">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styleUrl: './action-bar.scss'
})
export class ActionBarComponent {
  showSearch = input(true);
  searchPlaceholder = input('Rechercher...');
  searchValue = input('');
  @Output() searchChange = new EventEmitter<string>();

  onSearch(value: string) {
    this.searchChange.emit(value);
  }
}

