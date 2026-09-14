import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { ORDER_STATUS_LABELS, Order, OrderStatus, Product } from '../../core/models';
import { InMemoryDbService } from '../../core/services/in-memory-db.service';
import { LayoutService } from '../../core/services/layout.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';
import { ProductDialog, ProductDialogData, ProductDialogResult } from './product-dialog';

@Component({
  selector: 'app-admin',
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    RupeesPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly db = inject(InMemoryDbService);
  private readonly products = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly layout = inject(LayoutService);
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
  protected readonly categories = this.products.categories;
  protected readonly orders = this.orderService.orders;

  protected readonly productSearch = signal('');

  protected readonly productRows = computed(() => {
    const term = this.productSearch().trim().toLowerCase();
    const list = this.products.products();
    return (term ? list.filter((p) => p.name.toLowerCase().includes(term)) : list).slice().sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  });

  protected readonly stats = computed(() => {
    const orders = this.orders();
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    return {
      products: this.products.products().length,
      unavailable: this.products.products().filter((p) => !p.isAvailable).length,
      orders: orders.length,
      revenue,
    };
  });

  protected categoryName(categoryId: string): string {
    return this.products.categoryById(categoryId)?.name ?? '—';
  }

  protected itemCount(order: Order): number {
    return this.orderService.itemsFor(order.id).reduce((sum, i) => sum + i.quantity, 0);
  }

  protected openProductDialog(product: Product | null): void {
    const data: ProductDialogData = { product, categories: this.categories() };
    this.dialog
      .open<ProductDialog, ProductDialogData, ProductDialogResult>(ProductDialog, {
        data,
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        if (product) {
          this.products.updateProduct(product.id, result);
          this.snackBar.open(`${result.name} updated`, 'Dismiss', { duration: 2500 });
        } else {
          this.products.createProduct(result);
          this.snackBar.open(`${result.name} added to the menu`, 'Dismiss', { duration: 2500 });
        }
      });
  }

  protected toggleAvailability(product: Product): void {
    this.products.updateProduct(product.id, { isAvailable: !product.isAvailable });
  }

  protected deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}" from the menu? This cannot be undone.`)) {
      return;
    }
    this.products.deleteProduct(product.id);
    this.snackBar.open(`${product.name} deleted`, 'Dismiss', { duration: 2500 });
  }

  protected changeStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateStatus(order.id, status);
    this.snackBar.open(`${order.orderNumber} → ${this.statusLabels[status]}`, 'Dismiss', {
      duration: 2500,
    });
  }

  protected resetData(): void {
    if (!confirm('Reset all products, orders and the cart back to the seed data?')) {
      return;
    }
    this.db.resetToSeed();
    this.snackBar.open('Demo data restored', 'Dismiss', { duration: 2500 });
  }
}
