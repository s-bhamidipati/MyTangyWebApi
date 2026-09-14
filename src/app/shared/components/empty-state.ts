import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="empty__icon" aria-hidden="true">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <h3>{{ heading() }}</h3>
      <p class="tg-muted">{{ message() }}</p>
      @if (actionLabel()) {
        <a mat-flat-button color="primary" [routerLink]="actionLink()">{{ actionLabel() }}</a>
      }
    </div>
  `,
  styles: `
    .empty {
      display: grid;
      justify-items: center;
      text-align: center;
      gap: 0.25rem;
      padding: clamp(2rem, 1rem + 5vw, 4rem) 1.25rem;
    }

    .empty__icon {
      display: grid;
      place-items: center;
      width: 76px;
      height: 76px;
      margin-bottom: 0.75rem;
      border-radius: 50%;
      background: var(--tg-tomato-soft);
      color: var(--tg-tomato);
    }

    .empty__icon mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .empty h3 {
      margin: 0;
    }

    .empty p {
      max-width: 42ch;
      margin-bottom: 1.25rem;
    }
  `,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly heading = input.required<string>();
  readonly message = input('');
  readonly actionLabel = input('');
  readonly actionLink = input<string | unknown[]>('/menu');
}
