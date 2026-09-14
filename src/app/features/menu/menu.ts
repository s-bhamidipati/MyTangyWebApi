import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CategorySlug, Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { EmptyState } from '../../shared/components/empty-state';
import { ProductCard } from '../../shared/components/product-card';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating';

@Component({
  selector: 'app-menu',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    ProductCard,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private readonly productService = inject(ProductService);

  /** Bound from the `menu/:category` route parameter. */
  readonly category = input<string | undefined>();

  protected readonly categories = this.productService.categories;
  protected readonly search = signal('');
  protected readonly vegOnly = signal(false);
  protected readonly inStockOnly = signal(true);
  protected readonly sort = signal<SortKey>('popular');

  protected readonly activeSlug = computed<CategorySlug | 'all'>(() => {
    const slug = this.category();
    return slug === 'pizza' || slug === 'icecream' ? slug : 'all';
  });

  protected readonly heading = computed(() => {
    const slug = this.activeSlug();
    if (slug === 'all') {
      return 'The whole menu';
    }
    return this.productService.categoryBySlug(slug)?.name ?? 'Menu';
  });

  protected readonly tagline = computed(() => {
    const slug = this.activeSlug();
    if (slug === 'all') {
      return 'Twenty things, all of them made the same day you eat them.';
    }
    return this.productService.categoryBySlug(slug)?.tagline ?? '';
  });

  protected readonly results = computed<Product[]>(() => {
    const slug = this.activeSlug();
    const term = this.search().trim().toLowerCase();

    let list = this.productService.products();

    if (slug !== 'all') {
      const categoryId = this.productService.categoryBySlug(slug)?.id;
      list = list.filter((p) => p.categoryId === categoryId);
    }
    if (this.vegOnly()) {
      list = list.filter((p) => p.isVeg);
    }
    if (this.inStockOnly()) {
      list = list.filter((p) => p.isAvailable);
    }
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term)),
      );
    }

    return this.applySort(list);
  });

  protected readonly hasFilters = computed(
    () => this.search().trim() !== '' || this.vegOnly() || !this.inStockOnly(),
  );

  protected clearFilters(): void {
    this.search.set('');
    this.vegOnly.set(false);
    this.inStockOnly.set(true);
    this.sort.set('popular');
  }

  private applySort(list: Product[]): Product[] {
    const sorted = [...list];
    switch (this.sort()) {
      case 'price-asc':
        return sorted.sort((a, b) => a.basePrice - b.basePrice);
      case 'price-desc':
        return sorted.sort((a, b) => b.basePrice - a.basePrice);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted.sort((a, b) => b.ratingCount - a.ratingCount);
    }
  }
}
