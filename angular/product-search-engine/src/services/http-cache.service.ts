// src/app/services/http-cache.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpCacheService {
  private cache = new Map<string, any>();

  private generateKey(url: string, body: any): string {
    // Serialize both URL and body into a unique cache key
    return `${url}|${JSON.stringify(body)}`;
  }

  get(url: string, body: any): any | null {
    const key = this.generateKey(url, body);
    return this.cache.has(key) ? this.cache.get(key) : null;
  }

  set(url: string, body: any, response: any): void {
    const key = this.generateKey(url, body);
    this.cache.set(key, response);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(url: string, body: any): void {
    const key = this.generateKey(url, body);
    this.cache.delete(key);
  }
}
