import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, Meta, SafeHtml, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environment';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Blog } from '../../models';
import { BlogService } from '../../services/brand.service';
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
  structuredData: SafeHtml | undefined;
  isBrowser: boolean;
  screenWidth: number = 0;

  constructor(
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private _blogService: BlogService,
    private meta: Meta,
    private title: Title,
    public _utilService: UtilService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    this.url = this.route.snapshot?.params?.['id'] || '';
    this.title.setTitle(`${this.url.replaceAll('-', ' ') || ''}`);
    this.meta.updateTag({
      name: 'description',
      content: `Latest details about ${this.url.replaceAll('-', ' ') || ''}.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `${this.url.replaceAll('-', ' ') || ''}${
        (this.url || '') && ', '
      } latest news, latest blogs, today new, today blogs`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${this.url.replaceAll('-', ' ') || ''}`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Latest details about ${this.url.replaceAll('-', ' ') || ''}.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
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
    });
  }
}
