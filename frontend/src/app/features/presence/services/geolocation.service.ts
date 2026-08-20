import { Injectable, signal } from '@angular/core';

export interface Coordinates { latitude: number; longitude: number; }

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly isChecking = signal(false);
  readonly isWithinPerimeter = signal<boolean | null>(null);
  readonly currentDistance = signal<number | null>(null);
  readonly userCoords = signal<Coordinates | null>(null);
  readonly errorMessage = signal<string | null>(null);

  checkLocation(): Promise<boolean> {
    this.isChecking.set(true);
    this.errorMessage.set(null);
    return new Promise((resolve) => {
      if (!navigator.geolocation) { this.fail('La géolocalisation n’est pas supportée par votre navigateur.', resolve); return; }
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        this.userCoords.set(coords);
        const distance = Math.round(this.distance(coords, { latitude: 4.051056, longitude: 9.767868 }));
        this.currentDistance.set(distance);
        this.isChecking.set(false);
        const allowed = distance <= 150;
        this.isWithinPerimeter.set(allowed);
        if (!allowed) this.errorMessage.set(`Vous êtes à environ ${distance} m. Vous devez être à moins de 150 m du centre.`);
        resolve(allowed);
      }, (error) => { this.fail(error.code === 1 ? 'Veuillez autoriser l’accès GPS pour valider votre présence sur site.' : 'Position GPS introuvable. Vérifiez que la localisation est activée.', resolve); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });
  }

  private fail(message: string, resolve: (value: boolean) => void): void { this.isChecking.set(false); this.isWithinPerimeter.set(false); this.errorMessage.set(message); resolve(false); }
  private distance(first: Coordinates, second: Coordinates): number { const radius = 6371e3; const lat = (second.latitude - first.latitude) * Math.PI / 180; const lon = (second.longitude - first.longitude) * Math.PI / 180; const a = Math.sin(lat / 2) ** 2 + Math.cos(first.latitude * Math.PI / 180) * Math.cos(second.latitude * Math.PI / 180) * Math.sin(lon / 2) ** 2; return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); }
}