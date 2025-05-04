import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@environment';

@Component({
  selector: 'app-disclaimer',
  imports: [],
  templateUrl: './disclaimer.component.html',
  styleUrl: './disclaimer.component.css',
})
export class DisclaimerComponent {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Disclaimer - The Great Products');
    this.meta.updateTag({
      name: 'description',
      content: `Disclaimer - The Great Products.`,
    });
    this.meta.updateTag({
      name: 'keywords',
      content: `Disclaimer, Discover, Find, Shop, Great, Trending, Viral, Latest, Today, Best, Quality, Products, Buy, Online`,
    });
    // Add Open Graph meta tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: 'Disclaimer - The Great Products',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `Disclaimer for the great products at The Great Products.`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content: environment.baseUrl + '/logo.png',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: `${environment.baseUrl}/disclaimer`,
    });
  }
}
