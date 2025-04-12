import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((d) => d.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./about/about.component').then((d) => d.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then((d) => d.ContactComponent),
  },
  {
    path: 'disclaimer',
    loadComponent: () =>
      import('./disclaimer/disclaimer.component').then(
        (d) => d.DisclaimerComponent
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        (d) => d.PrivacyPolicyComponent
      ),
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./blogs/blogs.component').then((d) => d.BlogsComponent),
  },
  {
    path: 'blogs/:id',
    loadComponent: () =>
      import('./blogs/blogs.component').then((d) => d.BlogsComponent),
  },
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./blog/blog.component').then((d) => d.BlogComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products.component').then((d) => d.ProductsComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./products/products.component').then((d) => d.ProductsComponent),
  },
  {
    path: '', // Default route (optional)
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
