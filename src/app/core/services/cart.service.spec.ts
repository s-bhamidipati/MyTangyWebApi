import { TestBed } from '@angular/core/testing';
import { CartService, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from './cart.service';
import { InMemoryDbService } from './in-memory-db.service';
import { ProductService } from './product.service';

describe('CartService', () => {
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
    cart.clear();
  });

  const margherita = () => products.productById('p-margherita')!;

  it('starts empty', () => {
    expect(cart.isEmpty()).toBe(true);
    expect(cart.count()).toBe(0);
    expect(cart.total()).toBe(0);
  });

  it('prices an item as base + size delta + toppings', () => {
    const product = margherita();
    const large = products.sizesFor(product.id).find((s) => s.label.startsWith('Large'))!;
    const price = cart.unitPriceFor(product, large.id, ['t-cheese']);
    expect(price).toBe(product.basePrice + large.priceDelta + 60);
  });

  it('merges an identical configuration instead of adding a second row', () => {
    const product = margherita();
    const sizeId = products.sizesFor(product.id)[0].id;

    cart.add({ product, sizeId, toppingIds: ['t-cheese'], quantity: 1 });
    cart.add({ product, sizeId, toppingIds: ['t-cheese'], quantity: 2 });

    expect(cart.items().length).toBe(1);
    expect(cart.count()).toBe(3);
  });

  it('keeps different topping combinations as separate rows', () => {
    const product = margherita();
    const sizeId = products.sizesFor(product.id)[0].id;

    cart.add({ product, sizeId, toppingIds: ['t-cheese'], quantity: 1 });
    cart.add({ product, sizeId, toppingIds: ['t-olives'], quantity: 1 });

    expect(cart.items().length).toBe(2);
  });

  it('removes a row when quantity drops to zero', () => {
    const product = margherita();
    const sizeId = products.sizesFor(product.id)[0].id;
    cart.add({ product, sizeId, toppingIds: [], quantity: 1 });

    cart.setQuantity(cart.items()[0].id, 0);

    expect(cart.isEmpty()).toBe(true);
  });

  it('charges delivery below the threshold and waives it above', () => {
    const product = margherita();
    const sizeId = products.sizesFor(product.id)[0].id;

    cart.add({ product, sizeId, toppingIds: [], quantity: 1 });
    expect(cart.subtotal()).toBeLessThan(FREE_DELIVERY_THRESHOLD);
    expect(cart.deliveryFee()).toBe(DELIVERY_FEE);

    cart.setQuantity(cart.items()[0].id, 5);
    expect(cart.subtotal()).toBeGreaterThanOrEqual(FREE_DELIVERY_THRESHOLD);
    expect(cart.deliveryFee()).toBe(0);
  });

  it('totals subtotal + tax + delivery', () => {
    const product = margherita();
    const sizeId = products.sizesFor(product.id)[0].id;
    cart.add({ product, sizeId, toppingIds: [], quantity: 1 });

    const expected = cart.subtotal() + cart.tax() + cart.deliveryFee();
    expect(cart.total()).toBeCloseTo(expected, 2);
  });
});
