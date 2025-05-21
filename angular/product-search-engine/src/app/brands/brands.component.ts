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
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Brand, Service } from '../../models';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-brands',
  imports: [
    CommonModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent {
  url: string = '';
  baseUrlEnv: string = '';
  brands: Brand[] = [];
  isLoadingList: any = [];
  isBrowser: boolean;
  screenWidth: number = 0;
  subscribedList: any[] = [];
  structuredDataSet: boolean = false; // Add this property
  structuredData: SafeHtml | undefined;
  searchForm: FormGroup;
  debounceTimer: any;
  oldSearchValue: string = '';
  searchTerm: string = '';
  affiliateBanners: Service[] = [];
  structuredDataJSON: any;

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    private _productService: ProductService,
    public sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    public _utilService: UtilService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.baseUrlEnv = environment.baseUrl || '';
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.searchForm = this.fb.group({
      name: [''],
      brands: [[]],
      categories: [[]],
      subCategories: [[]],
    });
    if (this.isBrowser && window) {
      // Safe to use window here
      this.screenWidth = window.innerWidth || 0;
    }
    //this.getBrands();
  }

  searching(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.oldSearchValue != value) {
        this.getBrands(value);
        this.oldSearchValue = value;
      }
    }, 500);
  }

  getBrands(value: string = '') {
    this._productService.getBrands(value).subscribe((response) => {
      if (response.isSuccess) {
        this.brands = response.data;
        this.isLoadingList = this.brands.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        this.getBanners();
        this.brands.forEach((x) => {
          let subscribed = this._productService
            .getProducts({
              name: '',
              brands: [x?._id || ''],
              categories: [],
              subCategories: [],
            })
            .subscribe((response) => {
              if (response.isSuccess) {
                if (!this.structuredDataSet && response.data?.length > 0) {
                  this.structuredDataJSON = {
                    '@context': 'https://schema.org/',
                    '@type': 'ItemList',
                    itemListElement: response.data?.map((product, index) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      url: environment?.baseUrl + this.url,
                      name: product?.name || '',
                      image:
                        product.imgUrl || environment?.baseUrl + '/logo.png',
                      brand: product.brand?.name || '',
                      brandLogo:
                        product.brand?.logoUrl ||
                        environment?.baseUrl + '/logo.png',
                      category: product?.category?.name || '',
                      categoryImage:
                        product?.category?.imgUrl ||
                        environment?.baseUrl + '/logo.png',
                      subCategory: product?.subCategory?.name || '',
                      subCategoryImage:
                        product?.subCategory?.imgUrl ||
                        environment?.baseUrl + '/logo.png',
                      colors: product?.colors || [],
                      sizes: product?.sizes || [],
                    })),
                  };
                }
                let brandId = response.data?.[0]?.brand?._id?.toString();
                if (
                  [true, false].includes(
                    this.isLoadingList?.find(
                      (x: any) => x.key?.toString() === brandId?.toString()
                    )?.value
                  )
                ) {
                  this.isLoadingList.find(
                    (x: any) => x.key?.toString() === brandId?.toString()
                  ).value = false;
                  this.brands = this.brands.map((x) => {
                    if (response.data?.[0]?.brand?._id === x?._id) {
                      x.products = response.data;
                    }
                    return x;
                  });
                }
              }
            });
          this.subscribedList.push(subscribed);
        });
      }
    });
  }

  getIsLoading(id: string) {
    return this.isLoadingList?.find((x: any) => x.key === id)?.value;
  }

  ngOnInit() {
    this.searchTerm = this.route.snapshot?.params?.['id'] || '';
    this.searchForm.get('name')?.setValue(this.searchTerm);
    this.url = this.router.url;
    this.title.setTitle(
      `${
        this._utilService.toTitleCase(this.searchTerm) || ''
      } Brands - The Great Products`
    );
    this.meta.updateTag({
      name: 'description',
      content: `Discover, Find & Shop, Trending, Viral, Latest, Today, Products, Best Products, Quality Items, Digital Services, Buy Online Electronics At The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Discover, Find, Shop, Great, Trending, Viral, Latest, Today, Products, Best, Quality, Items, Digital, Services, Buy, Online, Electronics, ${
        this._utilService.toTitleCase(this.searchTerm) || ''
      }`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${
        this._utilService.toTitleCase(this.searchTerm) || ''
      } Brands - The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover, Find & Shop, The Latest Products, Best Products, Quality Items, Digital Services, Buy Online Electronics At The Great Products.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: environment.baseUrl + this.url,
    });
    this.getBrands(this.searchTerm);
  }

  getBanners(value: string = '') {
    this._productService.getAffiliateBanners(value).subscribe((response) => {
      if (response.isSuccess) {
        this.affiliateBanners = response.data;
        let amazonBrand = this.structuredDataJSON.itemListElement.find(
          (x: any) => x.name === 'Amazon'
        );
        amazonBrand.services = response.data.map((service, index) => {
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: `${environment?.baseUrl}/services${this.url}`,
            name: service?.name || '',
            image: service.imgUrl || environment?.baseUrl + '/logo.png',
          };
        });
        if (this.isBrowser) {
          this.structuredData = this.sanitizer?.bypassSecurityTrustHtml(
            `<script type="application/ld+json">${JSON.stringify(
              this.structuredDataJSON
            )}</script>`
          );
          this.structuredDataSet = true;
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscribedList.forEach((x: any) => {
      x?.unsubscribe();
    });
  }
}
