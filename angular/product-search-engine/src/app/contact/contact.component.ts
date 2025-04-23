import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@environment';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Contact Us - The Great Products');
    this.meta.updateTag({
      name: 'description',
      content: `Contact Us - contact@thegreatproducts.com - The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Contact, Discover, Find, Shop, Great, Trending, Viral, Latest, Today, Best, Quality, Products, Buy, Online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: 'Contact Us - The Great Products',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Contact Us - contact@thegreatproducts.com - The Great Products.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: `${environment.baseUrl}/contact`,
    });
  }
}
