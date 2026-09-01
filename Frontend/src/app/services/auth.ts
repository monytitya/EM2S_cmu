import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Api } from './api';

export interface LoginResponse { jwt: string; }

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly storageKey = 'hr_access_token';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.login(username, password);
  }

  setToken(token: string): void { localStorage.setItem(this.storageKey, token); }
  token(): string | null { return localStorage.getItem(this.storageKey); }
  isAuthenticated(): boolean { return Boolean(this.token()); }
  logout(): void { localStorage.removeItem(this.storageKey); void this.router.navigate(['/login']); }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(Auth).token();
  if (!token || request.url.includes('/auth/')) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const authGuard = () => inject(Auth).isAuthenticated() || inject(Router).createUrlTree(['/login']);
