import { Routes } from '@angular/router';

export const routes: Routes = [
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
    redirectTo: 'products',
    pathMatch: 'full',
  },
];
