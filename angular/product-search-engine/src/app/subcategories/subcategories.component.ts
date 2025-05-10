import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '@environment';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SubCategory } from '../../models';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-subcategories',
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.css',
})
export class SubCategoriesComponent {
  url: string = '';
  baseUrlEnv: string = '';
  subcategories: SubCategory[] = [];
  isLoadingList: any = [];
  isBrowser: boolean;
  screenWidth: number = 0;
  subscribedList: any[] = [];
  structuredDataSet: boolean = false; // Add this property
  structuredData: SafeHtml | undefined;

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    private _productService: ProductService,
    public sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    public _utilService: UtilService
  ) {
    this.baseUrlEnv = environment.baseUrl || '';
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && window) {
      // Safe to use window here
      this.screenWidth = window.innerWidth || 0;
    }
    this.getSubCategories();
  }
  getSubCategories() {
    this._productService.getSubCategories().subscribe((response) => {
      if (response.isSuccess) {
        this.subcategories = response.data;
        this.isLoadingList = this.subcategories.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        this.subcategories.forEach((x) => {
          let subscribed = this._productService
            .getProducts({
              name: '',
              brands: [],
              categories: [],
              subCategories: [x?._id?.toString() || ''],
            })
            .subscribe((response) => {
              if (response.isSuccess) {
                if (!this.structuredDataSet && response.data?.length > 0) {
                  const structuredDataJSON = {
                    '@context': 'https://schema.org/',
                    '@type': 'ItemList',
                    itemListElement: response.data?.map((product, index) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      url: environment?.baseUrl + '/' + this.url,
                      name: product?.name || '',
                      image:
                        product.imgUrl || environment?.baseUrl + '/logo.png',
                      brand: product.brand?.name || '',
                      category: product?.category?.name || '',
                      subCategory: product?.subCategory?.name || '',
                      colors: product?.colors || [],
                      sizes: product?.sizes || [],
                    })),
                  };
                  if (this.isBrowser) {
                    this.structuredData =
                      this.sanitizer?.bypassSecurityTrustHtml(
                        `<script type="application/ld+json">${JSON.stringify(
                          structuredDataJSON
                        )}</script>`
                      );
                    this.structuredDataSet = true;
                  }
                }
                let subCategoryId =
                  response.data?.[0]?.subCategory?._id?.toString();
                if (
                  [true, false].includes(
                    this.isLoadingList?.find(
                      (x: any) =>
                        x.key?.toString() === subCategoryId?.toString()
                    )?.value
                  )
                ) {
                  this.isLoadingList.find(
                    (x: any) => x.key?.toString() === subCategoryId?.toString()
                  ).value = false;
                }
                this.subcategories = this.subcategories.map((x) => {
                  if (
                    response.data?.[0]?.subCategory?._id?.toString() ===
                    x?._id?.toString()
                  ) {
                    x.products = response.data;
                  }
                  return x;
                });
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
    this.url = this.router.url;
    this.title.setTitle(`subcategories - The Great Products`);
    this.meta.updateTag({
      name: 'description',
      content: `Discover, Find & Shop, Trending, Viral, Latest, Today, Products, Best Products, Quality Items, Buy Online At The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Discover, Find, Shop, Great, Trending, Viral, Latest, Today, Products, Best, Quality, Items, Buy Online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover, Find & Shop, The Latest Products, Best Products, Quality Items, Buy Online At The Great Products.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: environment.baseUrl + this.url,
    });
  }

  ngOnDestroy() {
    this.subscribedList.forEach((x: any) => {
      x?.unsubscribe();
    });
  }
}
