import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccountProfile, Api, LoginResponse, RegisterResponse } from './api';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly storageKey = 'hr_access_token';
  private readonly profileSubject = new BehaviorSubject<AccountProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.login(username, password);
  }

  register(username: string, email: string, password: string, role = 'USER'): Observable<RegisterResponse> {
    return this.api.register(username, email, password, role);
  }

  setToken(token: string): void { localStorage.setItem(this.storageKey, token); }
  token(): string | null { return localStorage.getItem(this.storageKey); }
  updateToken(token: string): void { this.setToken(token); }
  setProfile(profile: AccountProfile): void { this.profileSubject.next(profile); }
  isAuthenticated(): boolean { return Boolean(this.token()); }
  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.profileSubject.next(null);
    void this.router.navigate(['/login']);
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(Auth).token();
  const requestPath = new URL(request.url, window.location.origin).pathname;
  const isPublicAuthRequest = request.method === 'POST'
    && (requestPath.endsWith('/api/auth/login') || requestPath.endsWith('/api/auth/register'));
  if (!token || isPublicAuthRequest) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const authGuard = () => inject(Auth).isAuthenticated() || inject(Router).createUrlTree(['/login']);
