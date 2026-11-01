import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Auth, authInterceptor } from './auth';
import { Api } from './api';

describe('Auth interceptor', () => {
  let auth: Auth;
  let api: Api;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('hr_access_token', 'current-token');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(Auth);
    api = TestBed.inject(Api);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.removeItem('hr_access_token');
  });

  it('attaches the bearer token to the authenticated current-profile request', () => {
    api.getCurrentProfile().subscribe();
    const request = httpTesting.expectOne('/api/auth/me');

    expect(request.request.headers.get('Authorization')).toBe('Bearer current-token');
    request.flush({
      id: 8,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    });
  });

  it('does not attach a bearer token to public login requests', () => {
    auth.login('admin', 'password').subscribe();
    const request = httpTesting.expectOne('/api/auth/login');

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ jwt: 'new-token' });
  });
});
