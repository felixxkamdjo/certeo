import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class PaginationComponent {
  totalItems = input.required<number>();
  itemsPerPage = input<number>(10);
  currentPage = input<number>(1);
  
  @Output() pageChange = new EventEmitter<number>();

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  
  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const visiblePages: (number | string)[] = [];
    
    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        visiblePages.push(i);
      }
    } else {
      if (current <= 3) {
        visiblePages.push(1, 2, 3, '...', total);
      } else if (current >= total - 2) {
        visiblePages.push(1, '...', total - 2, total - 1, total);
      } else {
        visiblePages.push(1, '...', current, '...', total);
      }
    }
    return visiblePages;
  });

  readonly startIndex = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  readonly endIndex = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return end > this.totalItems() ? this.totalItems() : end;
  });

  goToPage(page: number | string): void {
    if (typeof page === 'string') return;
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }
}
