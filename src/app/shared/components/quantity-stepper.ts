import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quantity-stepper',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper" role="group" [attr.aria-label]="label()">
      <button
        type="button"
        class="stepper__btn"
        [disabled]="quantity() <= min()"
        (click)="change.emit(quantity() - 1)"
        [attr.aria-label]="'Decrease ' + label()"
      >
        <mat-icon>remove</mat-icon>
      </button>
      <span class="stepper__value" aria-live="polite">{{ quantity() }}</span>
      <button
        type="button"
        class="stepper__btn"
        [disabled]="quantity() >= max()"
        (click)="change.emit(quantity() + 1)"
        [attr.aria-label]="'Increase ' + label()"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: `
    .stepper {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      border: 1px solid var(--tg-line);
      border-radius: var(--tg-radius-pill);
      background: var(--tg-surface);
      padding: 0.15rem;
    }

    .stepper__btn {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--tg-tomato);
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .stepper__btn:hover:not(:disabled) {
      background: var(--tg-tomato-soft);
    }

    .stepper__btn:disabled {
      color: var(--tg-line);
      cursor: not-allowed;
    }

    .stepper__btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .stepper__value {
      min-width: 2ch;
      text-align: center;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 768px) {
      .stepper__btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
      }
    }
  `,
})
export class QuantityStepper {
  readonly quantity = input.required<number>();
  readonly min = input(1);
  readonly max = input(20);
  readonly label = input('quantity');
  readonly change = output<number>();
}
