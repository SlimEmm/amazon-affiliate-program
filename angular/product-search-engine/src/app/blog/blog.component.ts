import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environment';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { Blog, Product, Service } from '../../models';
import { BlogService } from '../../services/brand.service';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';
declare const window: any;

@Component({
  selector: 'app-blog',
  imports: [NgbTooltip, CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent {
  url: string;
  blog: Blog = new Blog();
  products: Product[] = [];
  blogs: Blog[] = [];
  structuredData: SafeHtml | undefined;
  isBrowser: boolean;
  screenWidth: number = 0;
  structuredDataSet: boolean = false;
  isLoadingProducts: boolean = false;
  isLoadingBlogs: boolean = false;
  baseUrlEnv: string = '';
  affiliateBanners: Service[] = [];

  constructor(
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private _blogService: BlogService,
    private meta: Meta,
    private title: Title,
    public _utilService: UtilService,
    private _productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.getBanners();
  }
  ngOnInit() {
    this.url = this.route.snapshot?.params?.['id'] || '';
    this.title.setTitle(
      `${this.url.replaceAll('-', ' ') || ''}${
        (this.url.replaceAll('-', ' ') || '') && ','
      } The Great Article - Trending, Viral, Latest, Today, New, Blog, Article`
    );
    this.meta.updateTag({
      name: 'description',
      content: `Latest Highlight About ${this.url.replaceAll(
        '-',
        ' '
      )} Trending, Viral, Latest, Today, News, Blogs, Articles.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `${this.url.replaceAll('-', ' ') || ''}${
        (this.url.replaceAll('-', ' ') || '') && ', '
      }Trending, Viral, Latest, Today, News, Blogs, Articles.`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${this.url.replaceAll('-', ' ') || ''}${
        (this.url.replaceAll('-', ' ') || '') && ','
      } The Great Article - Trending, Viral, Latest, Today, New, Blog, Article.`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Latest Highlight About ${this.url.replaceAll(
        '-',
        ' '
      )} Trending, Viral, Latest, Today, News, Blog, Article.`,
    });
    this.meta.updateTag({
      property: 'og:url',
      content: `${environment.baseUrl}/blog/${this.url}`,
    });
    this.getBlogByUrl();
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser && window) {
      // Safe to use window here
      this.screenWidth = window.innerWidth || 0;
    }
  }

  getBlogByUrl() {
    this._blogService.getBlogByUrl({ url: this.url }).subscribe((response) => {
      this.blog = response.data;
      this.meta.updateTag({
        property: 'og:image',
        content: this.blog.thumbnail || environment.baseUrl + '/logo.png',
      });
      this.getProducts(this.blog.searchTerm);
    });
  }

  getProducts(value: string) {
    this.isLoadingProducts = true;
    let filters = {
      name: value,
      brands: [],
      categories: [],
      subCategories: [],
    };
    this._productService
      .getProducts(filters)
      .pipe(
        finalize(() => {
          this.isLoadingProducts = false;
        })
      )
      .subscribe((response) => {
        if (response.isSuccess) {
          this.products = response.data;
          if (!this.structuredDataSet) {
            const structuredDataJSON = {
              '@context': 'https://schema.org/',
              '@type': 'ItemList',
              areaServed: {
                '@type': 'Country',
                name: 'India',
              },
              provider: {
                '@type': 'Organization',
                name: 'The Great Products',
                url: `${environment?.baseUrl}`,
              },
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
            this.getBlogs(
              '', //value,
              structuredDataJSON
            );
          }
        }
      });
  }

  getBanners(value: string = '') {
    this._productService.getAffiliateBanners(value).subscribe((response) => {
      if (response.isSuccess) {
        this.affiliateBanners = response.data;
      }
    });
  }

  getBlogs(value: string, structuredDataJSON: any) {
    this.isLoadingBlogs = true;
    let filters = {
      title: value,
    };
    this._blogService
      .getBlogs(filters)
      .pipe(
        finalize(() => {
          this.isLoadingBlogs = false;
        })
      )
      .subscribe((response) => {
        if (response.isSuccess) {
          this.blogs = response.data?.filter(
            (x) => x._id?.toString() != this.blog?._id?.toString()
          );
          if (!this.structuredDataSet) {
            const blogsElement = this.blogs.map((blog, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: environment.baseUrl + '/blog/' + blog.url,
              title: blog.title,
              thumbnail: blog.thumbnail || environment.baseUrl + '/logo.png',
              thumbnailDetail: blog.thumbnailDetail,
              searchTerm: blog.searchTerm,
            }));
            if (this.isBrowser) {
              structuredDataJSON.itemListElement = [
                ...structuredDataJSON.itemListElement,
                blogsElement,
              ];
              this.structuredData = this.sanitizer.bypassSecurityTrustHtml(
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
