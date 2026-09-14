import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { RupeesPipe } from '../pipes/rupees-pipe';
import { IMAGE_FALLBACK_ICECREAM, IMAGE_FALLBACK_PIZZA } from '../../core/data/seed-data';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, RupeesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card" [class.card--out]="!product().isAvailable">
      <a class="card__media" [routerLink]="['/product', product().id]">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          loading="lazy"
          decoding="async"
          width="600"
          height="450"
          (error)="onImageError($event)"
        />
        @if (!product().isAvailable) {
          <span class="card__sold">Sold out</span>
        }
        @if (product().tags[0]; as tag) {
          <span class="card__tag">{{ tag }}</span>
        }
      </a>

      <div class="card__body">
        <div class="card__head">
          <h3 class="card__title">
            <a [routerLink]="['/product', product().id]">{{ product().name }}</a>
          </h3>
          <span
            class="card__diet"
            [class.card__diet--veg]="product().isVeg"
            [matTooltip]="product().isVeg ? 'Vegetarian' : 'Non-vegetarian'"
            aria-hidden="true"
          ></span>
        </div>

        <p class="card__desc">{{ product().description }}</p>

        <div class="card__meta">
          <span class="card__rating">
            <mat-icon aria-hidden="true">star</mat-icon>
            {{ product().rating }}
            <span class="tg-muted">({{ product().ratingCount }})</span>
          </span>
          @if (spice(); as heat) {
            <span class="tg-chip tg-chip--warn">{{ heat }}</span>
          }
        </div>

        <div class="card__foot">
          <span>
            <span class="tg-muted card__from">from</span>
            <span class="tg-price">{{ product().basePrice | rupees }}</span>
          </span>
          <a
            mat-flat-button
            color="primary"
            [routerLink]="['/product', product().id]"
            [attr.aria-label]="'Choose options for ' + product().name"
          >
            {{ product().isAvailable ? 'Add' : 'View' }}
          </a>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--tg-surface);
      border: 1px solid var(--tg-line);
      border-radius: var(--tg-radius);
      box-shadow: var(--tg-shadow-sm);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .card:hover,
    .card:focus-within {
      transform: translateY(-4px);
      box-shadow: var(--tg-shadow-lg);
    }

    .card--out {
      opacity: 0.72;
    }

    .card__media {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3;
      background: var(--tg-surface-alt);
      overflow: hidden;
    }

    .card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .card:hover .card__media img {
      transform: scale(1.05);
    }

    .card__tag,
    .card__sold {
      position: absolute;
      top: 0.65rem;
      left: 0.65rem;
      padding: 0.2rem 0.65rem;
      border-radius: var(--tg-radius-pill);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      background: var(--tg-overlay);
      color: var(--tg-ink);
      backdrop-filter: blur(4px);
    }

    .card__sold {
      inset: auto 0.65rem 0.65rem auto;
      left: auto;
      background: var(--tg-contrast-bg);
      color: var(--tg-contrast-fg);
    }

    .card__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.9rem 1rem 1rem;
    }

    .card__head {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .card__title {
      font-size: 1.05rem;
      margin: 0;
      line-height: 1.25;
    }

    .card__diet {
      flex: none;
      width: 15px;
      height: 15px;
      margin-top: 3px;
      border: 2px solid var(--tg-tomato-dark);
      border-radius: 3px;
      position: relative;
    }

    .card__diet::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      background: var(--tg-tomato-dark);
    }

    .card__diet--veg {
      border-color: var(--tg-basil);
    }

    .card__diet--veg::after {
      background: var(--tg-basil);
    }

    .card__desc {
      margin: 0;
      color: var(--tg-ink-muted);
      font-size: 0.86rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .card__rating {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
    }

    .card__rating mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--tg-honey);
    }

    .card__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 0.6rem;
    }

    .card__from {
      display: block;
      font-size: 0.68rem;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .card__foot .tg-price {
      font-size: 1.05rem;
    }
  `,
})
export class ProductCard {
  private readonly productService = inject(ProductService);

  readonly product = input.required<Product>();

  readonly spice = computed(() => {
    const level = this.product().spiceLevel;
    return level >= 3 ? 'Extra hot' : level === 2 ? 'Hot' : level === 1 ? 'Mild heat' : '';
  });

  onImageError(event: Event): void {
    const el = event.target as HTMLImageElement;
    const fallback =
      this.productService.categorySlugOf(this.product()) === 'pizza'
        ? IMAGE_FALLBACK_PIZZA
        : IMAGE_FALLBACK_ICECREAM;
    if (el.src !== fallback) {
      el.src = fallback;
    }
  }
}
