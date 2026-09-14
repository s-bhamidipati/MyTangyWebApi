import { TestBed } from '@angular/core/testing';
import { InMemoryDbService } from './in-memory-db.service';
import { ProductService } from './product.service';

describe('InMemoryDbService', () => {
  let db: InMemoryDbService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    db = TestBed.inject(InMemoryDbService);
    db.resetToSeed();
  });

  it('seeds both categories and the full menu', () => {
    expect(db.categories().length).toBe(2);
    expect(db.products().length).toBe(20);
    expect(db.productSizes().length).toBe(60);
  });

  it('inserts, updates and removes rows', () => {
    const id = db.nextId('t');
    db.insert(db.toppings, {
      id,
      name: 'Test topping',
      price: 10,
      appliesTo: 'pizza',
      isVeg: true,
    });
    expect(db.findById(db.toppings, id)?.name).toBe('Test topping');

    db.update(db.toppings, id, { price: 25 });
    expect(db.findById(db.toppings, id)?.price).toBe(25);

    db.remove(db.toppings, id);
    expect(db.findById(db.toppings, id)).toBeUndefined();
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => db.nextId('x')));
    expect(ids.size).toBe(200);
  });

  it('cascades a product delete to its sizes', () => {
    const products = TestBed.inject(ProductService);
    products.deleteProduct('p-margherita');

    expect(db.findById(db.products, 'p-margherita')).toBeUndefined();
    expect(db.query(db.productSizes, (s) => s.productId === 'p-margherita').length).toBe(0);
  });

  it('restores seed data after a reset', () => {
    products_removeOne();
    db.resetToSeed();
    expect(db.products().length).toBe(20);
  });

  function products_removeOne(): void {
    db.remove(db.products, 'p-margherita');
  }
});
