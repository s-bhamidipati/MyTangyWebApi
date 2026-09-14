import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ORDER_STATUS_LABELS, Order, OrderStatus } from '../../core/models';
import { OrderService } from '../../core/services/order.service';
import { EmptyState } from '../../shared/components/empty-state';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';

@Component({
  selector: 'app-orders',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, RupeesPipe, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly orderService = inject(OrderService);

  protected readonly orders = this.orderService.orders;
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  protected itemCount(order: Order): number {
    return this.orderService.itemsFor(order.id).reduce((sum, i) => sum + i.quantity, 0);
  }

  protected summary(order: Order): string {
    const names = this.orderService.itemsFor(order.id).map((i) => i.productName);
    return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ');
  }

  protected statusClass(status: OrderStatus): string {
    switch (status) {
      case 'delivered':
        return 'pill--done';
      case 'cancelled':
        return 'pill--cancelled';
      case 'out_for_delivery':
        return 'pill--moving';
      default:
        return 'pill--active';
    }
  }
}
