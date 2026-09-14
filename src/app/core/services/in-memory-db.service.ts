import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import {
  SEED_CART_ITEMS,
  SEED_CATEGORIES,
  SEED_ORDERS,
  SEED_ORDER_ITEMS,
  SEED_PRODUCTS,
  SEED_PRODUCT_SIZES,
  SEED_TOPPINGS,
} from '../data/seed-data';
import { CartItem, Category, Order, OrderItem, Product, ProductSize, Topping } from '../models';

const STORAGE_KEY = 'tangy.db.v1';

interface DbSnapshot {
  categories: Category[];
  products: Product[];
  productSizes: ProductSize[];
  toppings: Topping[];
  cartItems: CartItem[];
  orders: Order[];
  orderItems: OrderItem[];
}

const seedSnapshot = (): DbSnapshot =>
  structuredClone({
    categories: SEED_CATEGORIES,
    products: SEED_PRODUCTS,
    productSizes: SEED_PRODUCT_SIZES,
    toppings: SEED_TOPPINGS,
    cartItems: SEED_CART_ITEMS,
    orders: SEED_ORDERS,
    orderItems: SEED_ORDER_ITEMS,
  });

/**
 * Signal-backed in-memory database. Every table is a `WritableSignal<T[]>`;
 * the whole snapshot is mirrored to localStorage so a refresh keeps the cart and orders.
 */
@Injectable({ providedIn: 'root' })
export class InMemoryDbService {
  readonly categories: WritableSignal<Category[]>;
  readonly products: WritableSignal<Product[]>;
  readonly productSizes: WritableSignal<ProductSize[]>;
  readonly toppings: WritableSignal<Topping[]>;
  readonly cartItems: WritableSignal<CartItem[]>;
  readonly orders: WritableSignal<Order[]>;
  readonly orderItems: WritableSignal<OrderItem[]>;

  constructor() {
    const initial = this.load() ?? seedSnapshot();
    this.categories = signal(initial.categories);
    this.products = signal(initial.products);
    this.productSizes = signal(initial.productSizes);
    this.toppings = signal(initial.toppings);
    this.cartItems = signal(initial.cartItems);
    this.orders = signal(initial.orders);
    this.orderItems = signal(initial.orderItems);

    effect(() => this.persist(this.snapshot()));
  }

  // ----------------------------------------------------------- generic CRUD

  insert<T extends { id: string }>(table: WritableSignal<T[]>, row: T): T {
    table.update((rows) => [...rows, row]);
    return row;
  }

  update<T extends { id: string }>(
    table: WritableSignal<T[]>,
    id: string,
    changes: Partial<T>,
  ): void {
    table.update((rows) => rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));
  }

  remove<T extends { id: string }>(table: WritableSignal<T[]>, id: string): void {
    table.update((rows) => rows.filter((row) => row.id !== id));
  }

  removeWhere<T>(table: WritableSignal<T[]>, predicate: (row: T) => boolean): void {
    table.update((rows) => rows.filter((row) => !predicate(row)));
  }

  clear<T>(table: WritableSignal<T[]>): void {
    table.set([]);
  }

  findById<T extends { id: string }>(table: WritableSignal<T[]>, id: string): T | undefined {
    return table().find((row) => row.id === id);
  }

  query<T>(table: WritableSignal<T[]>, predicate: (row: T) => boolean): T[] {
    return table().filter(predicate);
  }

  /** Sequential-ish unique key; good enough for a browser-only store. */
  nextId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  resetToSeed(): void {
    const fresh = seedSnapshot();
    this.categories.set(fresh.categories);
    this.products.set(fresh.products);
    this.productSizes.set(fresh.productSizes);
    this.toppings.set(fresh.toppings);
    this.cartItems.set(fresh.cartItems);
    this.orders.set(fresh.orders);
    this.orderItems.set(fresh.orderItems);
  }

  // ------------------------------------------------------------ persistence

  private snapshot(): DbSnapshot {
    return {
      categories: this.categories(),
      products: this.products(),
      productSizes: this.productSizes(),
      toppings: this.toppings(),
      cartItems: this.cartItems(),
      orders: this.orders(),
      orderItems: this.orderItems(),
    };
  }

  private load(): DbSnapshot | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<DbSnapshot>;
      const seed = seedSnapshot();
      // Merge against the seed so a snapshot written by an older build still boots.
      return {
        categories: parsed.categories ?? seed.categories,
        products: parsed.products ?? seed.products,
        productSizes: parsed.productSizes ?? seed.productSizes,
        toppings: parsed.toppings ?? seed.toppings,
        cartItems: parsed.cartItems ?? [],
        orders: parsed.orders ?? seed.orders,
        orderItems: parsed.orderItems ?? seed.orderItems,
      };
    } catch {
      return null;
    }
  }

  private persist(snapshot: DbSnapshot): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Quota exceeded or private mode — the in-memory copy stays authoritative.
    }
  }
}
