import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-code-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss'
})
export class QrCodeViewComponent {
  readonly siteId = signal('ODC-YDE-ACCUEIL-01');
  readonly generatedAt = signal(new Date());
  readonly qrCells = Array.from({ length: 169 }, (_, index) => index).filter((index) => {
    const row = Math.floor(index / 13);
    const column = index % 13;
    return this.isFinderCell(row, column, 0, 0) || this.isFinderCell(row, column, 0, 8) || this.isFinderCell(row, column, 8, 0) || ((row * 7 + column * 11 + row * column) % 5 < 2);
  });

  downloadSvg(): void {
    const cells = this.qrCells.map((cell) => `<rect x="${cell % 13}" y="${Math.floor(cell / 13)}" width="1" height="1"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13"><rect width="13" height="13" fill="white"/><g fill="black">${cells}</g></svg>`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    link.download = `${this.siteId()}.svg`;
    link.click();
  }

  print(): void { window.print(); }

  regenerate(): void {
    if (window.confirm('La régénération invalidera le QR code actuellement affiché. Continuer ?')) this.generatedAt.set(new Date());
  }

  private isFinderCell(row: number, column: number, startRow: number, startColumn: number): boolean {
    const localRow = row - startRow;
    const localColumn = column - startColumn;
    return localRow >= 0 && localRow < 5 && localColumn >= 0 && localColumn < 5 && (localRow === 0 || localRow === 4 || localColumn === 0 || localColumn === 4 || (localRow === 2 && localColumn === 2));
  }
}
