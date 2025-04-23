import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@environment';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css',
})
export class PrivacyPolicyComponent {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Privacy Policy - The Great Products');
    this.meta.updateTag({
      name: 'description',
      content: `Privacy Policy of The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Privacy Policy, Discover, Find, Shop, Great, Viral, Trending Latest, Best, Quality, Products, Items, Buy, Online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: 'Privacy Policy - The Great Products',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Privacy Policy for the great products at The Great Products.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: `${environment.baseUrl}/privacy-policy`,
    });
  }

}
