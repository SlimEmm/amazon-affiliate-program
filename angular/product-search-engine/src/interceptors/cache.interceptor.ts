// src/app/interceptors/cache.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheService } from '../services/http-cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheService: HttpCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache POST requests (you can customize this)
    if (req.method !== 'POST') {
      return next.handle(req);
    }

    const cachedResponse = this.cacheService.get(req.urlWithParams, req.body);
    if (cachedResponse) {
      return of(new HttpResponse({ body: cachedResponse, status: 200 }));
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cacheService.set(req.urlWithParams, req.body, event.body);
        }
      })
    );
  }
}
