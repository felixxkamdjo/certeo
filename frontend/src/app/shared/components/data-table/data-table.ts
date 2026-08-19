import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnDef {
  key: string;
  header: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTableComponent {
  @Input({ required: true }) columns: ColumnDef[] = [];
  @Input({ required: true }) data: any[] = [];
  @Output() rowClick = new EventEmitter<any>();
}
