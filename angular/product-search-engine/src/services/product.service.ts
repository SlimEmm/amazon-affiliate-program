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
    name:string
  ): Observable<Response<Brand[]>> {
    return this.apiService.post(
      `user/brands`,
      {name}
    );
  }

  getCategories(
    name:string
  ): Observable<Response<Category[]>> {
    return this.apiService.post(
      `user/categories`,
      {name}
    );
  }

  getSubCategories(
    name:string
  ): Observable<Response<SubCategory[]>> {
    return this.apiService.post(
      `user/subcategories`,
      {name}
    );
  }
}
