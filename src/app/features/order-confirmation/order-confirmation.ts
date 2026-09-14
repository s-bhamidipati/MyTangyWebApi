import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../core/models';
import { OrderService } from '../../core/services/order.service';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';

@Component({
  selector: 'app-order-confirmation',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, RupeesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation {
  private readonly orders = inject(OrderService);

  /** Bound from the `order/:id` route parameter. */
  readonly id = input.required<string>();

  protected readonly statusFlow = ORDER_STATUS_FLOW;
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly paymentLabels = PAYMENT_METHOD_LABELS;

  protected readonly order = computed(() => this.orders.orderById(this.id()));
  protected readonly items = computed(() => this.orders.itemsFor(this.id()));

  protected readonly currentStep = computed(() => {
    const status = this.order()?.status;
    if (!status || status === 'cancelled') {
      return -1;
    }
    return ORDER_STATUS_FLOW.indexOf(status);
  });
}
