import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@env/environment';

export type QueryParamsMap = Record<
  string,
  string | number | boolean | readonly (string | number | boolean)[] | undefined
>;

export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | QueryParamsMap;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = ENVIRONMENT.apiBaseUrl.replace(/\/+$/, '');

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
  }

  private normalizeOptions(optionsOrParams?: HttpOptions | QueryParamsMap): HttpOptions | undefined {
    if (!optionsOrParams) return undefined;
    if ('params' in optionsOrParams || 'headers' in optionsOrParams || 'responseType' in optionsOrParams) {
      return optionsOrParams as HttpOptions;
    }
    return { params: optionsOrParams as QueryParamsMap };
  }

  get<T>(endpoint: string, optionsOrParams?: HttpOptions | QueryParamsMap): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = this.normalizeOptions(optionsOrParams);
    const request$ = this.http.get(url, options as object) as Observable<T>;
    return request$;
  }

  post<T>(endpoint: string, body: unknown, optionsOrParams?: HttpOptions | QueryParamsMap): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = this.normalizeOptions(optionsOrParams);
    const request$ = this.http.post(url, body, options as object) as Observable<T>;
    return request$;
  }

  put<T>(endpoint: string, body: unknown, optionsOrParams?: HttpOptions | QueryParamsMap): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = this.normalizeOptions(optionsOrParams);
    const request$ = this.http.put(url, body, options as object) as Observable<T>;
    return request$;
  }

  patch<T>(endpoint: string, body: unknown, optionsOrParams?: HttpOptions | QueryParamsMap): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = this.normalizeOptions(optionsOrParams);
    const request$ = this.http.patch(url, body, options as object) as Observable<T>;
    return request$;
  }

  delete<T>(endpoint: string, optionsOrParams?: HttpOptions | QueryParamsMap): Observable<T> {
    const url = this.buildUrl(endpoint);
    const options = this.normalizeOptions(optionsOrParams);
    const request$ = this.http.delete(url, options as object) as Observable<T>;
    return request$;
  }
}
