import { Injectable, signal } from '@angular/core';

export interface Coordinates { latitude: number; longitude: number; }

const ODC_CENTER: Coordinates = { latitude: 4.051056, longitude: 9.767868 };
const MAX_RADIUS_METERS = 150;

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly isChecking        = signal(false);
  readonly isWithinPerimeter = signal<boolean | null>(null);
  readonly currentDistance   = signal<number | null>(null);
  readonly userCoords        = signal<Coordinates | null>(null);
  readonly errorMessage      = signal<string | null>(null);

  /**
   * En développement (localhost / 127.0.0.1), le check GPS est bypassé
   * SAUF si l'URL contient ?geo=test — ce qui permet de voir l'écran de
   * vérification GPS sans aller sur site.
   */
  private get isDev(): boolean {
    const isLocal = typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const forceGeo = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('geo') === 'test';
    return isLocal && !forceGeo;
  }

  checkLocation(): Promise<boolean> {
    if (this.isDev) {
      // Bypass dev — simule une position valide sur site
      this.isChecking.set(false);
      this.isWithinPerimeter.set(true);
      this.currentDistance.set(0);
      this.userCoords.set(ODC_CENTER);
      this.errorMessage.set(null);
      return Promise.resolve(true);
    }

    this.isChecking.set(true);
    this.errorMessage.set(null);

    return new Promise(resolve => {
      if (!navigator.geolocation) {
        this.fail('La géolocalisation n\'est pas supportée par votre navigateur.', resolve);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const coords: Coordinates = {
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.userCoords.set(coords);

          const distance = Math.round(this.haversine(coords, ODC_CENTER));
          this.currentDistance.set(distance);
          this.isChecking.set(false);

          const allowed = distance <= MAX_RADIUS_METERS;
          this.isWithinPerimeter.set(allowed);

          if (!allowed) {
            this.errorMessage.set(
              `Vous êtes à environ ${distance} m du centre. ` +
              `Vous devez être à moins de ${MAX_RADIUS_METERS} m pour vous enregistrer.`
            );
          }
          resolve(allowed);
        },
        error => {
          const msg = error.code === error.PERMISSION_DENIED
            ? 'Veuillez autoriser l\'accès GPS pour valider votre présence sur site.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Position GPS introuvable. Vérifiez que la localisation est activée.'
              : 'Délai GPS dépassé. Veuillez réessayer.';
          this.fail(msg, resolve);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private fail(message: string, resolve: (v: boolean) => void): void {
    this.isChecking.set(false);
    this.isWithinPerimeter.set(false);
    this.errorMessage.set(message);
    resolve(false);
  }

  private haversine(a: Coordinates, b: Coordinates): number {
    const R    = 6_371_000;
    const dLat = (b.latitude  - a.latitude)  * Math.PI / 180;
    const dLon = (b.longitude - a.longitude) * Math.PI / 180;
    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);
    const h = sinLat * sinLat +
      Math.cos(a.latitude * Math.PI / 180) *
      Math.cos(b.latitude * Math.PI / 180) *
      sinLon * sinLon;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
}
