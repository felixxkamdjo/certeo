import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TableSearchOption {
  label: string;
  value: string;
}

export interface TableSearchFilter {
  key: string;
  label: string;
  type: 'select' | 'date';
  options?: TableSearchOption[];
  value?: string;
}

@Component({
  selector: 'app-table-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-search.html',
  styleUrl: './table-search.scss',
})
export class TableSearchComponent {
  readonly placeholder = input('Rechercher...');
  readonly searchValue = input('');
  readonly filters = input<TableSearchFilter[]>([]);
  readonly showReset = input(true);

  readonly searchChange = output<string>();
  readonly filterChange = output<{ key: string; value: string }>();
  readonly reset = output<void>();

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onFilterChange(key: string, value: string): void {
    this.filterChange.emit({ key, value });
  }

  onReset(): void {
    this.reset.emit();
  }
}
