import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environment';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import {
  Brand,
  Category,
  Product,
  ProductsRequestCommand,
  SubCategory,
} from '../../models';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';
import { FooterLinksComponent } from '../footer-links/footer-links.component';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgbTooltip,
    FooterLinksComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  isProd: boolean = true;
  searchForm: FormGroup;
  products: Product[] = [];
  filters: ProductsRequestCommand = new ProductsRequestCommand();
  brands: Brand[] = [];
  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  searchTerm: string = '';
  structuredData: SafeHtml | undefined;
  url: string = '';
  isLoading: boolean = false;
  baseUrlEnv: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private _productService: ProductService,
    public _utilService: UtilService,
    private meta: Meta,
    private title: Title,
    private sanitizer: DomSanitizer
  ) {
    this.isProd = true; //environment.production || false;
    this.baseUrlEnv = environment.baseUrl || '';
    this.searchForm = this.fb.group({
      name: [''],
      brands: [[]],
      categories: [[]],
      subCategories: [[]],
    });
    this.getBrands();
    this.getCategories();
    this.getSubCategories();
  }
  debounceTimer: any;

  ngOnInit() {
    this.searchTerm = this.route.snapshot?.params?.['id'] || '';
    this.searchForm.get('name')?.setValue(this.searchTerm);
    this.url = this.router.url;
    this.title.setTitle(
      `${this.searchTerm || ''} ${
        (this.searchTerm || '') && '|'
      } The Great Products`
    );
    this.meta.updateTag({
      name: 'description',
      content: `Find the best ${this.searchTerm || ''} at The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `${this.searchTerm || ''}${
        (this.searchTerm || '') && ', '
      }best products, quality items, buy online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${this.searchTerm || ''} ${
        (this.searchTerm || '') && '|'
      } The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover and shop the best ${this.searchTerm || ''} here.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: environment.baseUrl + this.url,
    });
    this.getProducts(this.searchTerm || '');
  }

  searching(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.getProducts(value);
    }, 500);
  }

  getBrands() {
    this._productService.getBrands().subscribe((response) => {
      if (response.isSuccess) {
        this.brands = response.data;
      }
    });
  }

  getCategories() {
    this._productService.getCategories().subscribe((response) => {
      if (response.isSuccess) {
        this.categories = response.data;
      }
    });
  }

  getSubCategories() {
    this._productService.getSubCategories().subscribe((response) => {
      if (response.isSuccess) {
        this.subcategories = response.data;
      }
    });
  }

  getProducts(value?: string) {
    this.isLoading = true;
    let filters = {
      name: value || this.searchForm.value.name,
      brands: this.searchForm.value.brands,
      categories: this.searchForm.value.categories,
      subCategories: this.searchForm.value.subCategories,
    };
    this._productService
      .getProducts(filters)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response.isSuccess) {
          this.products = response.data;
          const structuredDataJSON = {
            '@context': 'https://schema.org/',
            '@type': 'ItemList',
            itemListElement: this.products.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: environment.baseUrl + this.url,
              name: product.name,
              image: environment.baseUrl + '/logo.png',
              brand: product.brand?.name || '',
              category: product.category?.name || '',
              subCategory: product.subCategory?.name || '',
              colors: product.colors,
              sizes: product.sizes,
            })),
          };

          this.structuredData = this.sanitizer.bypassSecurityTrustHtml(
            `<script type="application/ld+json">${JSON.stringify(
              structuredDataJSON
            )}</script>`
          );
        }
      });
  }
}
