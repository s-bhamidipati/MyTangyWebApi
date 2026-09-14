import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tg-container tg-page nf">
      <span class="nf__art" aria-hidden="true">🍕</span>
      <h1>404 — this slice is gone</h1>
      <p class="tg-muted">
        Someone got here first. The page you are after does not exist, or it moved.
      </p>
      <div class="nf__actions">
        <a mat-flat-button color="primary" routerLink="/">Back home</a>
        <a mat-stroked-button routerLink="/menu">See the menu</a>
      </div>
    </div>
  `,
  styles: `
    .nf {
      display: grid;
      justify-items: center;
      text-align: center;
      padding-block: clamp(3rem, 2rem + 6vw, 6rem);
    }

    .nf__art {
      font-size: clamp(3.5rem, 2rem + 8vw, 6rem);
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .nf p {
      max-width: 44ch;
      margin-bottom: 1.5rem;
    }

    .nf__actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
})
export class NotFound {}
