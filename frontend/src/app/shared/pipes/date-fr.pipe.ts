import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFr',
  standalone: true
})
export class DateFrPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '-';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}
