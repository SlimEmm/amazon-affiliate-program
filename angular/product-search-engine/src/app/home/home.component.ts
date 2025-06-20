import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '@environment';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Brand, Category, SubCategory } from '../../models';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  url: string = '';
  baseUrlEnv: string = '';
  brands: Brand[] = [];
  categories: Category[] = [];
  subcategories: SubCategory[] = [];
  isLoadingList: any = [];
  isBrowser: boolean;
  screenWidth: number = 0;
  subscribedList: any[] = [];
  structuredDataSet: boolean = false; // Add this property
  structuredData: SafeHtml | undefined;
  structuredDataJSON: any;

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

  getBrands() {
    this._productService.getBrands('').subscribe((response) => {
      if (response.isSuccess) {
        this.brands = response.data;
        this.isLoadingList = this.brands.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        this.structuredDataJSON.itemListElement = [
          ...this.structuredDataJSON?.itemListElement,
          ...response.data?.map((brand, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${environment?.baseUrl}/brands${this.url}`,
            name: brand?.name || '',
            logo: brand.logoUrl || environment?.baseUrl + '/logo.png',
          })),
        ];
        this.getCategories();
      }
    });
  }

  getCategories() {
    this._productService.getCategories('').subscribe((response) => {
      if (response.isSuccess) {
        this.categories = response.data;
        this.isLoadingList = this.categories.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        this.structuredDataJSON.itemListElement = [
          ...this.structuredDataJSON?.itemListElement,
          ...response.data?.map((category, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${environment?.baseUrl}/categories${this.url}`,
            name: category?.name || '',
            image: category.imgUrl || environment?.baseUrl + '/logo.png',
          })),
        ];
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

  getSubCategories() {
    this._productService.getSubCategories('').subscribe((response) => {
      if (response.isSuccess) {
        this.subcategories = response.data;
        this.isLoadingList = this.subcategories.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        if (!this.structuredDataSet && response.data?.length > 0) {
          this.structuredDataJSON = {
            '@context': 'https://schema.org/',
            '@type': 'ItemList',
            itemListElement: response.data?.map((brand, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${environment?.baseUrl}/subcategories${this.url}`,
              name: brand?.name || '',
              image: brand.imgUrl || environment?.baseUrl + '/logo.png',
            })),
            areaServed: {
              '@type': 'Country',
              name: 'India',
            },
            provider: {
              '@type': 'Organization',
              name: 'The Great Products',
              url: `${environment?.baseUrl}`,
            },
          };
        }
        this.getBrands();
      }
    });
  }

  getIsLoading(id: string) {
    return this.isLoadingList?.find((x: any) => x.key === id)?.value;
  }

  ngOnInit() {
    this.url = this.router.url;
    this.title.setTitle(`Home - The Great Products`);
    this.meta.updateTag({
      name: 'description',
      content: `Discover, Find & Shop, Trending, Viral, Latest, Today, Products, Best Products, Quality Items, Digital Services, Buy Online Electronics At The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Discover, Find, Shop, Great, Trending, Viral, Latest, Today, Products, Best, Quality, Items, Digital, Services, Buy, Online, Electronics`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover, Find & Shop, The Latest Products, Best Products, Quality Items Digital, Services, Buy Online Electronics At The Great Products.`,
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
