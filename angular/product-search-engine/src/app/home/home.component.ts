import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '@environment';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  url: string = '';
  baseUrlEnv: string = '';


  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    this.baseUrlEnv = environment.baseUrl || '';
  }

  ngOnInit() {
    this.url = this.router.url;
    this.title.setTitle(`The Great Products`);
    this.meta.updateTag({
      name: 'description',
      content: `Find the best products at The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `best products, quality items, buy online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `The Great Products`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Discover and shop the best products here.`,
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
}
