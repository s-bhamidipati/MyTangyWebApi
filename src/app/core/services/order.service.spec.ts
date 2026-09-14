import { TestBed } from '@angular/core/testing';
import { CheckoutDetails, OrderService } from './order.service';
import { CartService } from './cart.service';
import { InMemoryDbService } from './in-memory-db.service';
import { ProductService } from './product.service';

const details: CheckoutDetails = {
  customerName: 'Test Customer',
  phone: '9999999999',
  email: 'test@example.com',
  address: '1 Test Street, Test City 000000',
  notes: 'Extra napkins',
  paymentMethod: 'upi',
};

describe('OrderService', () => {
  let orders: OrderService;
  let cart: CartService;
  let products: ProductService;
  let db: InMemoryDbService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    db = TestBed.inject(InMemoryDbService);
    db.resetToSeed();
    products = TestBed.inject(ProductService);
    cart = TestBed.inject(CartService);
    orders = TestBed.inject(OrderService);
    cart.clear();
  });

  const fillCart = () => {
    const product = products.productById('p-pepperoni')!;
    const sizeId = products.sizesFor(product.id)[1].id;
    cart.add({ product, sizeId, toppingIds: ['t-cheese'], quantity: 2 });
  };

  it('refuses to place an order with an empty cart', () => {
    expect(() => orders.placeOrder(details)).toThrow();
  });

  it('snapshots cart lines into order items and empties the cart', () => {
    fillCart();
    const expectedTotal = cart.total();

    const order = orders.placeOrder(details);

    expect(order.status).toBe('placed');
    expect(order.total).toBeCloseTo(expectedTotal, 2);
    expect(order.customerName).toBe(details.customerName);
    expect(cart.isEmpty()).toBe(true);

    const items = orders.itemsFor(order.id);
    expect(items.length).toBe(1);
    expect(items[0].productName).toBe('Double Pepperoni');
    expect(items[0].quantity).toBe(2);
    expect(items[0].toppingNames).toContain('Extra mozzarella');
  });

  it('issues incrementing order numbers', () => {
    fillCart();
    const first = orders.placeOrder(details);
    fillCart();
    const second = orders.placeOrder(details);

    const firstNumber = Number(first.orderNumber.replace('TNG-', ''));
    const secondNumber = Number(second.orderNumber.replace('TNG-', ''));
    expect(secondNumber).toBe(firstNumber + 1);
  });

  it('updates an order status', () => {
    fillCart();
    const order = orders.placeOrder(details);

    orders.updateStatus(order.id, 'delivered');

    expect(orders.orderById(order.id)?.status).toBe('delivered');
  });
});
