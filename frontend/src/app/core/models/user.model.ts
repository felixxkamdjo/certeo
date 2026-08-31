// core/models/user.model.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserSession {
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userFullName: string;
  userEmail: string;
  role: string;
}
