import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Tangy — Wood-fired Pizza & Artisan Ice Cream',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'menu',
    title: 'Menu — Tangy',
    loadComponent: () => import('./features/menu/menu').then((m) => m.Menu),
  },
  {
    path: 'menu/:category',
    title: 'Menu — Tangy',
    loadComponent: () => import('./features/menu/menu').then((m) => m.Menu),
  },
  {
    path: 'product/:id',
    title: 'Product — Tangy',
    loadComponent: () =>
      import('./features/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    title: 'Your cart — Tangy',
    loadComponent: () => import('./features/cart/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    title: 'Checkout — Tangy',
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'order/:id',
    title: 'Order confirmed — Tangy',
    loadComponent: () =>
      import('./features/order-confirmation/order-confirmation').then((m) => m.OrderConfirmation),
  },
  {
    path: 'orders',
    title: 'Your orders — Tangy',
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'admin',
    title: 'Staff console — Tangy',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
  },
  {
    path: '**',
    title: 'Page not found — Tangy',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
