import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { EmptyState } from '../../shared/components/empty-state';
import { RupeesPipe } from '../../shared/pipes/rupees-pipe';

@Component({
  selector: 'app-checkout',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    RupeesPipe,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly cart = inject(CartService);
  protected readonly submitting = signal(false);

  protected readonly paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'upi', label: PAYMENT_METHOD_LABELS.upi, icon: 'qr_code_2' },
    { value: 'card', label: PAYMENT_METHOD_LABELS.card, icon: 'credit_card' },
    { value: 'cash', label: PAYMENT_METHOD_LABELS.cash, icon: 'payments' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(200)]],
    paymentMethod: ['upi' as PaymentMethod, [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid || this.cart.isEmpty()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const order = this.orders.placeOrder(this.form.getRawValue());
      void this.router.navigate(['/order', order.id]);
    } catch {
      this.snackBar.open('Something went wrong placing that order.', 'Dismiss', { duration: 4000 });
    } finally {
      this.submitting.set(false);
    }
  }
}
