import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService, FREE_DELIVERY_THRESHOLD } from '../../core/services/cart.service';
import { EmptyState } from '../../shared/components/empty-state';
import { QuantityStepper } from '../../shared/components/quantity-stepper';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, QuantityStepper, RupeesPipe, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private readonly snackBar = inject(MatSnackBar);

  protected readonly cart = inject(CartService);
  protected readonly freeDeliveryThreshold = FREE_DELIVERY_THRESHOLD;

  protected remove(cartItemId: string, name: string): void {
    this.cart.remove(cartItemId);
    this.snackBar.open(`${name} removed`, 'Dismiss', { duration: 2500 });
  }

  protected clear(): void {
    this.cart.clear();
    this.snackBar.open('Cart emptied', 'Dismiss', { duration: 2500 });
  }
}
