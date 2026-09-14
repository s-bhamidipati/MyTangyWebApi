import { Injectable, computed, inject } from '@angular/core';
import { Category, CategorySlug, Product, ProductSize, Topping } from '../models';
import { InMemoryDbService } from './in-memory-db.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly db = inject(InMemoryDbService);

  readonly categories = computed(() =>
    [...this.db.categories()].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  readonly products = this.db.products.asReadonly();
  readonly toppings = this.db.toppings.asReadonly();

  readonly availableProducts = computed(() => this.products().filter((p) => p.isAvailable));

  readonly featuredProducts = computed(() =>
    this.availableProducts().filter((p) => p.isFeatured),
  );

  categoryBySlug(slug: CategorySlug): Category | undefined {
    return this.categories().find((c) => c.slug === slug);
  }

  categoryById(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  categorySlugOf(product: Product): CategorySlug {
    return this.categoryById(product.categoryId)?.slug ?? 'pizza';
  }

  productById(id: string): Product | undefined {
    return this.db.findById(this.db.products, id);
  }

  sizesFor(productId: string): ProductSize[] {
    return this.db
      .query(this.db.productSizes, (s) => s.productId === productId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  sizeById(id: string): ProductSize | undefined {
    return this.db.findById(this.db.productSizes, id);
  }

  toppingsFor(slug: CategorySlug): Topping[] {
    return this.db.query(this.db.toppings, (t) => t.appliesTo === slug);
  }

  toppingsByIds(ids: string[]): Topping[] {
    const set = new Set(ids);
    return this.db.query(this.db.toppings, (t) => set.has(t.id));
  }

  // ------------------------------------------------------------------ admin

  createProduct(input: Omit<Product, 'id' | 'createdAt'>): Product {
    const product: Product = {
      ...input,
      id: this.db.nextId('p'),
      createdAt: new Date().toISOString(),
    };
    this.db.insert(this.db.products, product);
    this.seedSizesFor(product);
    return product;
  }

  updateProduct(id: string, changes: Partial<Product>): void {
    this.db.update(this.db.products, id, changes);
  }

  deleteProduct(id: string): void {
    this.db.remove(this.db.products, id);
    this.db.removeWhere(this.db.productSizes, (s) => s.productId === id);
    this.db.removeWhere(this.db.cartItems, (c) => c.productId === id);
  }

  /** A new product still needs selectable sizes, so mirror the seed size ladder. */
  private seedSizesFor(product: Product): void {
    const isPizza = this.categorySlugOf(product) === 'pizza';
    const ladder = isPizza
      ? [
          { label: 'Regular 8"', description: 'Serves 1', priceDelta: 0 },
          { label: 'Medium 11"', description: 'Serves 2', priceDelta: 120 },
          { label: 'Large 14"', description: 'Serves 3–4', priceDelta: 240 },
        ]
      : [
          { label: 'Single scoop', description: '90 ml', priceDelta: 0 },
          { label: 'Double scoop', description: '180 ml', priceDelta: 70 },
          { label: 'Take-home tub', description: '500 ml', priceDelta: 190 },
        ];

    ladder.forEach((size, index) => {
      this.db.insert(this.db.productSizes, {
        id: `${product.id}-size-${index}`,
        productId: product.id,
        label: size.label,
        description: size.description,
        priceDelta: size.priceDelta,
        sortOrder: index + 1,
      });
    });
  }
}
