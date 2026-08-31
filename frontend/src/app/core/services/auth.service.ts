// core/services/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { LoginCredentials, AuthResponse, UserSession } from '../models/user.model';
import { StorageService } from './storage.service';
import { ENVIRONMENT } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly endpoint = `${ENVIRONMENT.apiBaseUrl}/auth`;

  readonly currentUser = signal<UserSession | null>(this.storage.getUser());
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.storage.getToken());

  login(credentials: LoginCredentials): Observable<UserSession> {
    const request$ = this.http.post<AuthResponse>(`${this.endpoint}/login`, credentials).pipe(
      map((response) => {
        const user: UserSession = {
          fullName: response.userFullName,
          email: response.userEmail,
          role: response.role
        };

        this.storage.saveAuthData(response.accessToken, response.refreshToken, user);
        this.currentUser.set(user);

        return user;
      })
    );
    return request$;
  }

  logout(): void {
    this.storage.clearAuth();
    this.currentUser.set(null);
  }

  hasRole(expectedRole: string): boolean {
    const user = this.currentUser();
    return user?.role === expectedRole;
  }
}
