import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { AuthResponse, AuthService } from "../services/auth.service";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('token');

    if (accessToken) {
      req = this.addToken(req, accessToken);
    }

    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401) {
          // Se la richiesta fallisce per 401, provo il refresh token
          return this.handle401Error(req, next);
        }
        return throwError(err);
      })
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        const tokenData = {
          Token: localStorage.getItem('token')!,
          RefreshToken: localStorage.getItem('refreshToken')!
        };
        return this.authService.refreshToken(tokenData).pipe(
          switchMap((tokenResponse: AuthResponse) => {
            this.isRefreshing = false;
            // Salvo i nuovi token nel localStorage
            localStorage.setItem('token', tokenResponse.Token);
            localStorage.setItem('refreshToken', tokenResponse.RefreshToken);
            this.refreshTokenSubject.next(tokenResponse.Token);
            // Clono la richiesta con il nuovo token e la rilancio
            return next.handle(this.addToken(req, tokenResponse.Token));
          }),
          catchError(err => {
            // Se il refresh fallisce, effettuo il logout (rimuovo token dal localStorage)
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(err);
          })
        );
      } else {
        // Se non esiste un refresh token, logout
        this.authService.logout();
        return throwError('No refresh token available');
      }
    } else {
      // Se è già in corso un refresh, aspetto che finisca
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addToken(req, token!)))
      );
    }
  }
}
