import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
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
import { Service } from '../../models';
import { ProductService } from '../../services/product.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-services',
  imports: [
    CommonModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  url: string = '';
  baseUrlEnv: string = '';
  affiliateBanners: Service[] = [];
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

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    private _productService: ProductService,
    public sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object,
    public _utilService: UtilService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.baseUrlEnv = environment.baseUrl || '';
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.searchForm = this.fb.group({
      name: [''],
    });
    if (this.isBrowser && window) {
      // Safe to use window here
      this.screenWidth = window.innerWidth || 0;
    }
    this.getBanners();
  }

  searching(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.oldSearchValue != value) {
        this.getBanners(value);
        this.oldSearchValue = value;
      }
    }, 500);
  }

  getBanners(value: string = '') {
    this._productService.getAffiliateBanners(value).subscribe((response) => {
      if (response.isSuccess) {
        this.affiliateBanners = response.data;
        this.cdr.detectChanges();
        if (!this.structuredDataSet && response.data?.length > 0) {
          const structuredDataJSON = {
            '@context': 'https://schema.org/',
            '@type': 'ItemList',
            itemListElement: response.data?.map((service: any, index: any) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: environment?.baseUrl + this.url,
              name: service?.name || '',
              image: service.imgUrl || environment?.baseUrl + '/logo.png',
              redirectTo: service.affiliateLink,
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
      } Services - The Great Products`
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
      } Services - The Great Products`,
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
    this.getBanners(this.searchTerm);
  }

  ngOnDestroy() {
    this.subscribedList.forEach((x: any) => {
      x?.unsubscribe();
    });
  }
}
