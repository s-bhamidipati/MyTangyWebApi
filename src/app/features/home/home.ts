import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, ProductCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly products = inject(ProductService);

  protected readonly categories = this.products.categories;
  protected readonly featured = computed(() => this.products.featuredProducts().slice(0, 8));

  protected readonly perks = [
    { icon: 'local_fire_department', title: '400°C stone oven', copy: 'Ninety seconds, blistered crust, every time.' },
    { icon: 'schedule', title: '30-minute promise', copy: 'Freshly boxed and out the door, fast.' },
    { icon: 'eco', title: 'Daily market produce', copy: 'Nothing sits overnight. Ever.' },
    { icon: 'local_shipping', title: 'Free over ₹699', copy: 'Delivery is on us for larger orders.' },
  ];
}
