import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
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
declare const window: any;

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
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  structuredDataSet: boolean = false; // Add this property

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
  isLoading: boolean = true;
  baseUrlEnv: string = '';
  isBrowser: boolean;
  screenWidth: number = 0;
  debounceTimer: any;
  oldSearchValue: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private _productService: ProductService,
    public _utilService: UtilService,
    private meta: Meta,
    private title: Title,
    public sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
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
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && window) {
      // Safe to use window here
      this.screenWidth = window.innerWidth || 0;
    }
  }

  ngOnInit() {
    this.searchTerm = this.route.snapshot?.params?.['id'] || '';
    this.searchForm.get('name')?.setValue(this.searchTerm);
    this.url = this.router.url;
    this.title.setTitle(
      `${this._utilService.toTitleCase(this.searchTerm) || ''} ${
        (this.searchTerm || '') && '|'
      } The Great Products - Latest & Best Products`
    );
    this.meta.updateTag({
      name: 'description',
      content: `Discover, Find & Shop ${
        this.searchTerm || ''
      } At The Great Products, Latest Products, Best Products, Quality Items, Buy Online.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `${this.searchTerm || ''}${
        (this.searchTerm || '') && ', '
      }Discover, Find, Shop, Great, Viral, Trending Latest, Best, Quality, Products, Items, Buy, Online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${this._utilService.toTitleCase(this.searchTerm) || ''} ${
        this.searchTerm || '' ? ' - ' : 'Products - '
      } The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover, Find & Shop The Best ${
        this.searchTerm || ''
      } At The Great Products, Trending, Viral, Latest, Best, Products, Quality, Items, Buy Online.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: `${environment.baseUrl}${this.url}`,
    });
    this.getProducts(this.searchTerm || '');
  }

  searching(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.oldSearchValue != value) {
        this.getProducts(value);
        this.oldSearchValue = value;
      }
    }, 500);
  }

  getBrands() {
    this._productService.getBrands('').subscribe((response) => {
      if (response.isSuccess) {
        this.brands = response.data;
      }
    });
  }

  getCategories() {
    this._productService.getCategories('').subscribe((response) => {
      if (response.isSuccess) {
        this.categories = response.data;
      }
    });
  }

  getSubCategories() {
    this._productService.getSubCategories('').subscribe((response) => {
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
          if (!this.structuredDataSet && this.products?.length > 0) {
            const structuredDataJSON = {
              '@context': 'https://schema.org/',
              '@type': 'ItemList',
              itemListElement: this.products?.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: environment?.baseUrl + this.url,
                name: product?.name || '',
                image: product.imgUrl || environment?.baseUrl + '/logo.png',
                brand: product.brand?.name || '',
                brandLogo:
                  product.brand?.logoUrl || environment?.baseUrl + '/logo.png',
                category: product?.category?.name || '',
                categoryImage: product?.category?.imgUrl || environment?.baseUrl + '/logo.png',
                subCategory: product?.subCategory?.name || '',
                subCategoryImage: product?.subCategory?.imgUrl || environment?.baseUrl + '/logo.png',
                colors: product?.colors || [],
                sizes: product?.sizes || [],
              })),
            };
            if (this.isBrowser) {
              this.structuredData = this.sanitizer?.bypassSecurityTrustHtml(
                `<script type="application/ld+json">${JSON.stringify(
                  structuredDataJSON
                )}</script>`
              );
              this.structuredDataSet = true;
            }
          }
        }
      });
  }
}
