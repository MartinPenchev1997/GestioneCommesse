// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  LoggedUser: string;
  Token: string;
  RefreshToken: string;
}

export interface AuthRequest {
  username: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5001/api/auth'; // aggiorna la porta se necessario

  constructor(private http: HttpClient, private router: Router) { }

  isAuthenticated(): boolean {
    // Check if the user is authenticated by verifying the token in local storage
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null')
      return false;

    return true;
  }

  getLoggedUser(): string {
    const user = localStorage.getItem('authUser');
    if (!user || user === 'undefined' || user === 'null')
      return '';

    return user;
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  register(request: AuthRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, request);
  }

  refreshToken(tokenData: AuthResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, tokenData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
      })
    );
  }
}

