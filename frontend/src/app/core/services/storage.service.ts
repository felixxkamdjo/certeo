import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn(`StorageService: Unable to set key "${key}"`);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`StorageService: Unable to remove key "${key}"`);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      console.warn('StorageService: Unable to clear storage');
    }
  }

  getJson<T>(key: string): T | null {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson<T>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  }
}
