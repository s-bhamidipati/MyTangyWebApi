import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ftr">
      <div class="tg-container ftr__grid">
        <div class="ftr__brandcol">
          <a class="ftr__brand" routerLink="/">
            <span aria-hidden="true">🍕</span> Tangy
          </a>
          <p>
            Wood-fired pizza and small-batch ice cream, made to order and delivered while it is
            still worth eating.
          </p>
          <div class="ftr__social" aria-label="Social links">
            <span class="ftr__dot"><mat-icon>public</mat-icon></span>
            <span class="ftr__dot"><mat-icon>alternate_email</mat-icon></span>
            <span class="ftr__dot"><mat-icon>call</mat-icon></span>
          </div>
        </div>

        <nav class="ftr__col" aria-label="Menu links">
          <h4>Menu</h4>
          <a routerLink="/menu/pizza">Pizzas</a>
          <a routerLink="/menu/icecream">Ice cream</a>
          <a routerLink="/menu">Everything</a>
        </nav>

        <nav class="ftr__col" aria-label="Account links">
          <h4>Your stuff</h4>
          <a routerLink="/cart">Cart</a>
          <a routerLink="/orders">Order history</a>
        </nav>

        <div class="ftr__col">
          <h4>Kitchen hours</h4>
          <p class="ftr__hours">Mon–Thu · 11:00 – 23:00</p>
          <p class="ftr__hours">Fri–Sun · 11:00 – 01:00</p>
        </div>
      </div>

      <div class="tg-container ftr__base">
        <p>© {{ year }} Tangy. A demo storefront — no real orders are dispatched.</p>
        <a class="ftr__admin" routerLink="/admin">Staff console</a>
      </div>
    </footer>
  `,
  styles: `
    .ftr {
      margin-top: clamp(3rem, 2rem + 4vw, 5rem);
      padding-top: clamp(2.5rem, 2rem + 2vw, 4rem);
      background: var(--tg-footer-bg);
      color: var(--tg-footer-fg);
      font-size: 0.9rem;
    }

    .ftr__grid {
      display: grid;
      gap: 2rem;
      grid-template-columns: 1fr;
      padding-bottom: 2.5rem;
    }

    .ftr__brand {
      display: inline-block;
      font-family: var(--tg-font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--tg-footer-strong);
      margin-bottom: 0.6rem;
    }

    .ftr__brandcol p {
      max-width: 42ch;
      color: var(--tg-footer-muted);
    }

    .ftr__social {
      display: flex;
      gap: 0.5rem;
    }

    .ftr__dot {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--tg-footer-chip);
      color: var(--tg-footer-strong);
    }

    .ftr__dot mat-icon {
      font-size: 19px;
      width: 19px;
      height: 19px;
    }

    .ftr__col {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .ftr__col h4 {
      margin: 0 0 0.2rem;
      font-family: var(--tg-font);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--tg-footer-strong);
    }

    .ftr__col a {
      color: var(--tg-footer-muted);
      transition: color 0.15s ease;
    }

    .ftr__col a:hover {
      color: var(--tg-honey);
    }

    .ftr__hours {
      margin: 0;
      color: var(--tg-footer-muted);
    }

    .ftr__base {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      padding-block: 1.1rem;
      border-top: 1px solid var(--tg-footer-line);
      font-size: 0.8rem;
      color: #8b827e;
    }

    .ftr__base p {
      margin: 0;
    }

    .ftr__admin {
      color: #8b827e;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .ftr__admin:hover {
      color: var(--tg-footer-strong);
    }

    @media (min-width: 600px) {
      .ftr__grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .ftr__grid {
        grid-template-columns: 2.2fr 1fr 1fr 1.3fr;
        gap: 3rem;
      }
    }
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
