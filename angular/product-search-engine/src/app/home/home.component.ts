import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
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
    this._productService.getBrands().subscribe((response) => {
      if (response.isSuccess) {
        this.brands = response.data;
        this.isLoadingList = this.brands.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
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

  getCategories() {
    this._productService.getCategories().subscribe((response) => {
      if (response.isSuccess) {
        this.categories = response.data;
        this.isLoadingList = this.categories.map((x) => {
          return {
            key: x._id.toString(),
            value: true,
          };
        });
        this.categories.forEach((x) => {
          let subscribed = this._productService
            .getProducts({
              name: '',
              brands: [],
              categories: [x._id || ''],
              subCategories: [],
            })
            .subscribe((response) => {
              if (response.isSuccess) {
                let categoryId = response.data?.[0]?.category?._id?.toString();
                if (
                  [true, false].includes(
                    this.isLoadingList?.find(
                      (x: any) => x.key?.toString() === categoryId?.toString()
                    )?.value
                  )
                ) {
                  this.isLoadingList.find(
                    (x: any) => x.key?.toString() === categoryId?.toString()
                  ).value = false;
                }
                this.categories = this.categories.map((x) => {
                  if (
                    response.data?.[0]?.category?._id?.toString() ===
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
        this.getBrands();
      }
    });
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
        this.getCategories();
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
