import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, TemplateRef, Directive, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnDef {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

@Directive({
  selector: '[appCellTemplate]',
  standalone: true
})
export class CellTemplateDirective {
  @Input('appCellTemplate') columnName: string = '';
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, CellTemplateDirective],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTableComponent implements AfterContentInit {
  @Input({ required: true }) columns: ColumnDef[] = [];
  @Input({ required: true }) data: any[] = [];
  @Output() rowClick = new EventEmitter<any>();

  @ContentChildren(CellTemplateDirective) cellTemplates!: QueryList<CellTemplateDirective>;
  
  templateMap: Record<string, TemplateRef<any>> = {};

  ngAfterContentInit() {
    this.cellTemplates.forEach(directive => {
      this.templateMap[directive.columnName] = directive.template;
    });
  }
}
