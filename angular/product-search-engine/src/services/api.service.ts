import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { Response } from '../models';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}
  apiUri = environment.apiUrl;
  public get(url: string): Observable<Response<any>> {
    return this.http.get<any>(`${this.apiUri}/${url}`);
  }
  public getById(id: string, url: string): Observable<Response<any>> {
    return this.http.get<any>(`${this.apiUri}/${url}/${id}`);
  }
  public post(url: string, body: any): Observable<Response<any>> {
    return this.http.post<any>(`${this.apiUri}/${url}`, body);
  }
  public postMultipartFormData(
    url: string,
    formData: FormData
  ): Observable<Response<any>> {
    return this.http.post<any>(`${this.apiUri}/${url}`, formData);
  }
  public put(id: string, url: string, body: any): Observable<Response<any>> {
    if (!id) {
      return this.http.put<any>(`${this.apiUri}/${url}`, body);
    }
    return this.http.put<any>(`${this.apiUri}/${url}/${id}`, body);
  }
  public putMultipartFormData(
    id: string,
    url: string,
    formData: FormData
  ): Observable<Response<any>> {
    if (!id) {
      return this.http.put<any>(`${this.apiUri}/${url}`, formData);
    }
    return this.http.put<any>(`${this.apiUri}/${url}/${id}`, formData);
  }
  public delete(id: string, url: string): Observable<Response<any>> {
    return this.http.delete<any>(`${this.apiUri}/${url}/${id}`);
  }
}
