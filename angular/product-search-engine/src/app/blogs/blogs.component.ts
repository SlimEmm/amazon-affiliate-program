import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environment';
import { finalize } from 'rxjs';
import { Blog } from '../../models';
import { BlogService } from '../../services/brand.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-blogs',
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInput,
  ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css',
})
export class BlogsComponent {
  structuredDataSet: boolean = false; // Add this property

  blogs: Blog[] = [];
  structuredData: SafeHtml | undefined;
  isLoading: boolean = false;
  debounceTimer: any;
  searchForm: FormGroup;
  baseUrlEnv: string = '';
  searchTerm: string = '';
  url: string = '';
  isBrowser: boolean;

  //paraphrase, and import image in paint first and image export only from paint

  constructor(
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private _blogService: BlogService,
    public _utilService: UtilService,
    private meta: Meta,
    private title: Title,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.baseUrlEnv = environment.baseUrl || '';
    this.searchForm = this.fb.group({
      title: [''],
    });
    this.getBlogs();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.searchTerm = this.route.snapshot?.params?.['id'] || '';
    this.searchForm.get('title')?.setValue(this.searchTerm);
    this.url = this.router.url;
    this.title.setTitle(`${this.searchTerm || ''}`);
    this.meta.updateTag({
      name: 'description',
      content: `Latest details about ${this.searchTerm || ''}.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `${this.searchTerm || ''}${
        (this.searchTerm || '') && ', '
      } latest news, latest blogs, today new, today blogs`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${this.searchTerm || ''}`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Latest details about ${this.searchTerm || ''}.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: environment.baseUrl + this.url,
    });
    // if(this.searchTerm)
    // {
    // this.getBlogs(this.searchTerm || '');
    // }
  }

  searching(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.getBlogs(value);
    }, 500);
  }

  getBlogs(value?: string) {
    this.isLoading = true;
    let filters = {
      title: value || this.searchForm.value.title,
    };
    // this.blogs = [
    //   {
    //     title:
    //       "China's BYD to Build First EV Plant in India Amid Rising Global Trade Barriers, China's BYD to Build First EV Plant in India Amid Rising Global Trade Barriers, China's BYD to Build First EV Plant in India Amid Rising Global Trade Barriers",
    //     url: 'china-byd',
    //     createdOn: new Date().toString(),
    //     updatedOn: new Date().toString(),
    //     content:
    //       "BYD, the world's largest electric vehicle (EV) maker, is set to build its first manufacturing plant in India, marking a pivotal move in its global expansion. The facility will be located in Rangareddy district, Telangana, approximately 60 kilometres from Hyderabad, as per a Business Standard report. This decision aligns with BYD’s strategy to navigate rising tariffs in Western markets, particularly in the United States and European Union (EU), where the company faces steep levies on Chinese EV imports. To comply with Indian regulations, BYD is expected to partner with Hyderabad-based Megha Engineering and Infrastructures Ltd (MEIL), with MEIL holding a majority stake in the venture.",
    //     thumbnail:
    //       'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1BT8nT.img?w=534&h=300&m=6',
    //     thumbnailDetail:
    //       "china's byd to build first ev plant in india amid rising global trade barriers",
    //     products: [],
    //     blogs: [],
    //   },
    // ];
    // const structuredDataJSON = {
    //   '@context': 'https://schema.org/',
    //   '@type': 'ItemList',
    //   itemListElement: this.blogs.map((blog, index) => ({
    //     '@type': 'ListItem',
    //     position: index + 1,
    //     url: environment.baseUrl + '/blog/' + blog.url,
    //     title: blog.title,
    //     thumbnail: blog.thumbnail || environment.baseUrl + '/logo.png',
    //     thumbnailDetail: blog.thumbnailDetail || '',
    //     content: blog.content || '',
    //   })),
    // };

    // this.structuredData = this.sanitizer.bypassSecurityTrustHtml(
    //   `<script type="application/ld+json">${JSON.stringify(
    //     structuredDataJSON
    //   )}</script>`
    // );
    this._blogService
      .getBlogs(filters)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response) => {
        if (response.isSuccess) {
          this.blogs = response.data;
          if (!this.structuredDataSet && this.blogs?.length > 0) {
            const structuredDataJSON = {
              '@context': 'https://schema.org/',
              '@type': 'ItemList',
              itemListElement: this.blogs.map((blog, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: environment.baseUrl + '/blog/' + blog.url,
                title: blog.title,
                thumbnail: blog.thumbnail || environment.baseUrl + '/logo.png',
                thumbnailDetail: blog.thumbnailDetail,
                products: blog.products,
                blogs: blog.blogs,
              })),
            };
            this.structuredData = this.sanitizer.bypassSecurityTrustHtml(
              `<script type="application/ld+json">${JSON.stringify(
                structuredDataJSON
              )}</script>`
            );
            this.structuredDataSet = true;
          }
        }
      });
  }
}
