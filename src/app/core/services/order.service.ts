import { Injectable, computed, inject } from '@angular/core';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../models';
import { CartService } from './cart.service';
import { InMemoryDbService } from './in-memory-db.service';

export interface CheckoutDetails {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly db = inject(InMemoryDbService);
  private readonly cart = inject(CartService);

  readonly orders = computed(() =>
    [...this.db.orders()].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    ),
  );

  orderById(id: string): Order | undefined {
    return this.db.findById(this.db.orders, id);
  }

  itemsFor(orderId: string): OrderItem[] {
    return this.db.query(this.db.orderItems, (i) => i.orderId === orderId);
  }

  /** Snapshots the cart into an immutable order, then empties the cart. */
  placeOrder(details: CheckoutDetails): Order {
    const lines = this.cart.lines();
    if (lines.length === 0) {
      throw new Error('Cannot place an order with an empty cart.');
    }

    const totals = this.cart.totals();
    const id = this.db.nextId('o');
    const order: Order = {
      id,
      orderNumber: this.nextOrderNumber(),
      customerName: details.customerName,
      phone: details.phone,
      email: details.email,
      address: details.address,
      notes: details.notes,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      status: 'placed',
      paymentMethod: details.paymentMethod,
      placedAt: new Date().toISOString(),
    };

    this.db.insert(this.db.orders, order);

    lines.forEach((line, index) => {
      this.db.insert<OrderItem>(this.db.orderItems, {
        id: `${id}-item-${index}`,
        orderId: id,
        productId: line.product.id,
        productName: line.product.name,
        productImageUrl: line.product.imageUrl,
        sizeLabel: line.size?.label ?? '',
        toppingNames: line.toppings.map((t) => t.name),
        quantity: line.item.quantity,
        unitPrice: line.item.unitPrice,
        lineTotal: line.item.lineTotal,
      });
    });

    this.cart.clear();
    return order;
  }

  updateStatus(orderId: string, status: OrderStatus): void {
    this.db.update<Order>(this.db.orders, orderId, { status });
  }

  private nextOrderNumber(): string {
    const highest = this.db
      .orders()
      .map((o) => Number.parseInt(o.orderNumber.replace('TNG-', ''), 10))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 1000);
    return `TNG-${highest + 1}`;
  }
}
