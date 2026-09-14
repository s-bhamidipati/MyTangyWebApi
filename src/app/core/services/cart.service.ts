import { Injectable, computed, inject } from '@angular/core';
import { CartItem, CartLine, OrderTotals, Product } from '../models';
import { InMemoryDbService } from './in-memory-db.service';
import { ProductService } from './product.service';

export const TAX_RATE = 0.05;
export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_THRESHOLD = 699;

export interface AddToCartRequest {
  product: Product;
  sizeId: string;
  toppingIds: string[];
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly db = inject(InMemoryDbService);
  private readonly products = inject(ProductService);

  readonly items = this.db.cartItems.asReadonly();

  /** Cart rows joined with product/size/topping rows, skipping any orphaned row. */
  readonly lines = computed<CartLine[]>(() =>
    this.items()
      .map((item) => {
        const product = this.products.productById(item.productId);
        if (!product) {
          return null;
        }
        return {
          item,
          product,
          size: this.products.sizeById(item.sizeId),
          toppings: this.products.toppingsByIds(item.toppingIds),
        } satisfies CartLine;
      })
      .filter((line): line is CartLine => line !== null),
  );

  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly isEmpty = computed(() => this.items().length === 0);

  readonly subtotal = computed(() =>
    round(this.lines().reduce((sum, line) => sum + line.item.lineTotal, 0)),
  );
  readonly tax = computed(() => round(this.subtotal() * TAX_RATE));
  readonly deliveryFee = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE,
  );
  readonly discount = computed(() => 0);
  readonly total = computed(() =>
    round(this.subtotal() + this.tax() + this.deliveryFee() - this.discount()),
  );

  readonly totals = computed<OrderTotals>(() => ({
    subtotal: this.subtotal(),
    tax: this.tax(),
    deliveryFee: this.deliveryFee(),
    discount: this.discount(),
    total: this.total(),
  }));

  /** Amount still needed to unlock free delivery, or 0 once unlocked. */
  readonly amountToFreeDelivery = computed(() =>
    Math.max(0, round(FREE_DELIVERY_THRESHOLD - this.subtotal())),
  );

  unitPriceFor(product: Product, sizeId: string, toppingIds: string[]): number {
    const size = this.products.sizeById(sizeId);
    const toppingTotal = this.products
      .toppingsByIds(toppingIds)
      .reduce((sum, t) => sum + t.price, 0);
    return round(product.basePrice + (size?.priceDelta ?? 0) + toppingTotal);
  }

  add({ product, sizeId, toppingIds, quantity }: AddToCartRequest): void {
    const normalisedToppings = [...toppingIds].sort();
    const unitPrice = this.unitPriceFor(product, sizeId, normalisedToppings);
    const existing = this.items().find(
      (i) =>
        i.productId === product.id &&
        i.sizeId === sizeId &&
        sameToppings(i.toppingIds, normalisedToppings),
    );

    if (existing) {
      this.setQuantity(existing.id, existing.quantity + quantity);
      return;
    }

    this.db.insert(this.db.cartItems, {
      id: this.db.nextId('ci'),
      productId: product.id,
      sizeId,
      toppingIds: normalisedToppings,
      quantity,
      unitPrice,
      lineTotal: round(unitPrice * quantity),
      addedAt: new Date().toISOString(),
    });
  }

  setQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(cartItemId);
      return;
    }
    const item = this.db.findById(this.db.cartItems, cartItemId);
    if (!item) {
      return;
    }
    const capped = Math.min(quantity, 20);
    this.db.update<CartItem>(this.db.cartItems, cartItemId, {
      quantity: capped,
      lineTotal: round(item.unitPrice * capped),
    });
  }

  remove(cartItemId: string): void {
    this.db.remove(this.db.cartItems, cartItemId);
  }

  clear(): void {
    this.db.clear(this.db.cartItems);
  }
}

const round = (value: number): number => Math.round(value * 100) / 100;

const sameToppings = (a: string[], b: string[]): boolean =>
  a.length === b.length && [...a].sort().every((id, index) => id === b[index]);
