// core/services/storage.service.ts
import { Injectable } from '@angular/core';
import { UserSession } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'certeo_token';
  private readonly REFRESH_TOKEN_KEY = 'certeo_refresh_token';
  private readonly USER_KEY = 'certeo_user';

  saveAuthData(token: string, refreshToken: string, user: UserSession): void {
    if (!token) {
      console.error('StorageService: token manquant ou undefined');
      return;
    }
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): UserSession | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw || raw === 'undefined') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
