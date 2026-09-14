import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Category, Product } from '../../core/models';

export interface ProductDialogData {
  product: Product | null;
  categories: Category[];
}

export type ProductDialogResult = Omit<Product, 'id' | 'createdAt'>;

@Component({
  selector: 'app-product-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.product ? 'Edit item' : 'New menu item' }}</h2>

    <mat-dialog-content>
      <form class="grid" [formGroup]="form" id="product-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="span">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          <mat-error>A name is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="categoryId">
            @for (category of data.categories; track category.id) {
              <mat-option [value]="category.id">{{ category.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Base price (₹)</mat-label>
          <input matInput type="number" min="0" formControlName="basePrice" />
          <mat-error>Enter a price of 0 or more.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
          <mat-error>A short description is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span">
          <mat-label>Image URL</mat-label>
          <input matInput formControlName="imageUrl" />
          <mat-hint>Any public https image URL</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Spice level (0–3)</mat-label>
          <input matInput type="number" min="0" max="3" formControlName="spiceLevel" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tags</mat-label>
          <input matInput formControlName="tags" />
          <mat-hint>Comma separated</mat-hint>
        </mat-form-field>

        <div class="toggles span">
          <mat-slide-toggle formControlName="isVeg">Vegetarian</mat-slide-toggle>
          <mat-slide-toggle formControlName="isAvailable">Available</mat-slide-toggle>
          <mat-slide-toggle formControlName="isFeatured">Featured</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" type="submit" form="product-form">
        {{ data.product ? 'Save changes' : 'Create item' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .grid {
      display: grid;
      gap: 0.35rem 1rem;
      padding-top: 0.5rem;
      min-width: min(72vw, 460px);
    }

    .grid mat-form-field {
      width: 100%;
    }

    .toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 1.5rem;
      padding-bottom: 0.5rem;
    }

    @media (min-width: 600px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .span {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class ProductDialog {
  private readonly fb = inject(FormBuilder);

  protected readonly dialogRef = inject(MatDialogRef<ProductDialog, ProductDialogResult>);
  protected readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.product?.name ?? '', [Validators.required, Validators.maxLength(60)]],
    categoryId: [this.data.product?.categoryId ?? this.data.categories[0]?.id ?? ''],
    description: [
      this.data.product?.description ?? '',
      [Validators.required, Validators.maxLength(240)],
    ],
    imageUrl: [this.data.product?.imageUrl ?? ''],
    basePrice: [this.data.product?.basePrice ?? 0, [Validators.required, Validators.min(0)]],
    spiceLevel: [this.data.product?.spiceLevel ?? 0, [Validators.min(0), Validators.max(3)]],
    tags: [this.data.product?.tags.join(', ') ?? ''],
    isVeg: [this.data.product?.isVeg ?? true],
    isAvailable: [this.data.product?.isAvailable ?? true],
    isFeatured: [this.data.product?.isFeatured ?? false],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      name: value.name.trim(),
      categoryId: value.categoryId,
      description: value.description.trim(),
      imageUrl: value.imageUrl.trim(),
      basePrice: Number(value.basePrice),
      spiceLevel: Number(value.spiceLevel),
      tags: value.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isVeg: value.isVeg,
      isAvailable: value.isAvailable,
      isFeatured: value.isFeatured,
      rating: this.data.product?.rating ?? 4.5,
      ratingCount: this.data.product?.ratingCount ?? 0,
    });
  }
}
