import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    pathMatch: 'full',
    loadComponent: () =>
      import('./home/home.component').then((d) => d.HomeComponent),
  },
  {
    path: 'about',
    pathMatch: 'full',
    loadComponent: () =>
      import('./about/about.component').then((d) => d.AboutComponent),
  },
  {
    path: 'contact',
    pathMatch: 'full',
    loadComponent: () =>
      import('./contact/contact.component').then((d) => d.ContactComponent),
  },
  {
    path: 'disclaimer',
    pathMatch: 'full',
    loadComponent: () =>
      import('./disclaimer/disclaimer.component').then(
        (d) => d.DisclaimerComponent
      ),
  },
  {
    path: 'privacy-policy',
    pathMatch: 'full',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        (d) => d.PrivacyPolicyComponent
      ),
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
    path: 'blogs',
    pathMatch: 'full',
    loadComponent: () =>
      import('./blogs/blogs.component').then((d) => d.BlogsComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./products/products.component').then((d) => d.ProductsComponent),
  },
  {
    path: 'brands',
    pathMatch: 'full',
    loadComponent: () =>
      import('./brands/brands.component').then((d) => d.BrandsComponent),
  },
  {
    path: 'categories',
    pathMatch: 'full',
    loadComponent: () =>
      import('./categories/categories.component').then((d) => d.CategoriesComponent),
  },
  {
    path: 'subcategories',
    pathMatch: 'full',
    loadComponent: () =>
      import('./subcategories/subcategories.component').then((d) => d.SubCategoriesComponent),
  },
  {
    path: 'products',
    pathMatch: 'full',
    loadComponent: () =>
      import('./products/products.component').then((d) => d.ProductsComponent),
  },
  {
    path: '', // Default route (optional)
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'home' },
];
