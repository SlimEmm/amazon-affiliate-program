import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { Brand, Category, Product, ProductsRequestCommand, Response, SubCategory } from '../models';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getProducts(
    productsRequestCommand: ProductsRequestCommand
  ): Observable<Response<Product[]>> {
    return this.apiService.post(
      `user/products`,
      productsRequestCommand
    );
  }

  getBrands(
  ): Observable<Response<Brand[]>> {
    return this.apiService.get(
      `user/brands`
    );
  }

  getCategories(
  ): Observable<Response<Category[]>> {
    return this.apiService.get(
      `user/categories`
    );
  }

  getSubCategories(
  ): Observable<Response<SubCategory[]>> {
    return this.apiService.get(
      `user/subcategories`
    );
  }
}
