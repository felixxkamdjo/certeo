import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User, UserCredentials, AuthResponse } from '@core/models';

const TOKEN_KEY = 'certeo_token';
const USER_KEY = 'certeo_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  // --- State (Signals) ---
  private readonly _currentUser = signal<User | null>(this.storage.getJson<User>(USER_KEY));
  private readonly _token = signal<string | null>(this.storage.get(TOKEN_KEY));

  /** The currently authenticated user, or null. */
  readonly currentUser = this._currentUser.asReadonly();

  /** Whether the user is authenticated. */
  readonly isAuthenticated = computed(() => !!this._token());

  /** The current user's role. */
  readonly userRole = computed(() => this._currentUser()?.role ?? null);

  // --- Actions ---

  login(credentials: UserCredentials): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this._token.set(response.token);
        this._currentUser.set(response.user);
        this.storage.set(TOKEN_KEY, response.token);
        this.storage.setJson(USER_KEY, response.user);
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  /** Restore auth state from storage (called on app init if needed). */
  restoreSession(): void {
    const token = this.storage.get(TOKEN_KEY);
    const user = this.storage.getJson<User>(USER_KEY);
    if (token && user) {
      this._token.set(token);
      this._currentUser.set(user);
    }
  }
}
