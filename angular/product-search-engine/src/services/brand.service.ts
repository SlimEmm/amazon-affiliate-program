import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { Brand, Category, Blog, BlogsRequestCommand, Response, SubCategory, BlogRequestCommand } from '../models';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private apiService: ApiService) {}

  getBlogs(
    blogsRequestCommand: BlogsRequestCommand
  ): Observable<Response<Blog[]>> {
    return this.apiService.post(
      `user/blogs`,
      blogsRequestCommand
    );
  }

  getBlogByUrl(
    blogRequestCommand: BlogRequestCommand
  ): Observable<Response<Blog>> {
    return this.apiService.post(
      `user/blog`,
      blogRequestCommand
    );
  }
}
