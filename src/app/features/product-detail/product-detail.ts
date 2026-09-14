import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IMAGE_FALLBACK_ICECREAM, IMAGE_FALLBACK_PIZZA } from '../../core/data/seed-data';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { QuantityStepper } from '../../shared/components/quantity-stepper';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';

@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatRadioModule,
    QuantityStepper,
    RupeesPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  /** Bound from the `product/:id` route parameter. */
  readonly id = input.required<string>();

  protected readonly product = computed(() => this.products.productById(this.id()));
  protected readonly sizes = computed(() => this.products.sizesFor(this.id()));
  protected readonly categorySlug = computed(() => {
    const product = this.product();
    return product ? this.products.categorySlugOf(product) : 'pizza';
  });
  protected readonly toppings = computed(() => this.products.toppingsFor(this.categorySlug()));

  protected readonly selectedSizeId = signal('');
  protected readonly selectedToppingIds = signal<string[]>([]);
  protected readonly quantity = signal(1);

  protected readonly related = computed(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    return this.products
      .availableProducts()
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  });

  protected readonly unitPrice = computed(() => {
    const product = this.product();
    if (!product) {
      return 0;
    }
    return this.cart.unitPriceFor(product, this.selectedSizeId(), this.selectedToppingIds());
  });

  protected readonly lineTotal = computed(() => this.unitPrice() * this.quantity());

  constructor() {
    // Reset the configurator whenever the route lands on a different product.
    effect(() => {
      const sizes = this.sizes();
      this.selectedSizeId.set(sizes[0]?.id ?? '');
      this.selectedToppingIds.set([]);
      this.quantity.set(1);
    });
  }

  protected isToppingSelected(toppingId: string): boolean {
    return this.selectedToppingIds().includes(toppingId);
  }

  protected toggleTopping(toppingId: string, checked: boolean): void {
    this.selectedToppingIds.update((ids) =>
      checked ? [...ids, toppingId] : ids.filter((id) => id !== toppingId),
    );
  }

  protected addToCart(goToCart = false): void {
    const product = this.product();
    if (!product || !product.isAvailable) {
      return;
    }

    this.cart.add({
      product,
      sizeId: this.selectedSizeId(),
      toppingIds: this.selectedToppingIds(),
      quantity: this.quantity(),
    });

    if (goToCart) {
      void this.router.navigate(['/cart']);
      return;
    }

    this.snackBar
      .open(`${product.name} added to your cart`, 'View cart', { duration: 3500 })
      .onAction()
      .subscribe(() => void this.router.navigate(['/cart']));
  }

  protected onImageError(event: Event): void {
    const el = event.target as HTMLImageElement;
    const fallback =
      this.categorySlug() === 'pizza' ? IMAGE_FALLBACK_PIZZA : IMAGE_FALLBACK_ICECREAM;
    if (el.src !== fallback) {
      el.src = fallback;
    }
  }

  protected heatLabel(level: number): string {
    return level >= 3 ? 'Extra hot' : level === 2 ? 'Hot' : level === 1 ? 'Mild heat' : '';
  }
}
