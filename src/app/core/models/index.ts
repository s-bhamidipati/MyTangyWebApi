/**
 * Column definitions for every table held by the in-memory database.
 * Each interface maps 1:1 to a table in `InMemoryDbService`.
 */

export type CategorySlug = 'pizza' | 'icecream';

export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'upi';

/** Table: categories */
export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  tagline: string;
  heroImageUrl: string;
  sortOrder: number;
}

/** Table: products */
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isVeg: boolean;
  spiceLevel: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
}

/** Table: product_sizes */
export interface ProductSize {
  id: string;
  productId: string;
  label: string;
  description: string;
  priceDelta: number;
  sortOrder: number;
}

/** Table: toppings */
export interface Topping {
  id: string;
  name: string;
  price: number;
  appliesTo: CategorySlug;
  isVeg: boolean;
}

/** Table: cart_items */
export interface CartItem {
  id: string;
  productId: string;
  sizeId: string;
  toppingIds: string[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  addedAt: string;
}

/** Table: orders */
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  placedAt: string;
}

/** Table: order_items */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sizeLabel: string;
  toppingNames: string[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** A cart row joined with its product, size and topping rows for display. */
export interface CartLine {
  item: CartItem;
  product: Product;
  size: ProductSize | undefined;
  toppings: Topping[];
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'placed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash on delivery',
  card: 'Credit / debit card',
  upi: 'UPI',
};
