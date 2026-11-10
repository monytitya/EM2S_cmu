import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let auth: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };
  let getRegistrationRoles: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getRegistrationRoles = vi.fn(() => of(['USER']));
    auth = {
      login: vi.fn(),
      register: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: auth },
        { provide: Api, useValue: { getRegistrationRoles } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('shows the backend login error instead of masking it', () => {
    auth.login.mockReturnValue(throwError(() => ({
      error: { error: 'Incorrect username or password' },
    })));
    fixture.componentInstance.username = 'user';
    fixture.componentInstance.password = 'wrong-password';

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Incorrect username or password');
  });

  it('explains unauthorized sign-in and offers account creation', () => {
    auth.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    fixture.componentInstance.username = 'new-user';
    fixture.componentInstance.password = 'password123';

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitting).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Check your username and password');
    const createAccount = fixture.nativeElement.querySelector('.error-action') as HTMLButtonElement;
    expect(createAccount).toBeTruthy();

    createAccount.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.mode).toBe('register');
    expect(fixture.componentInstance.username).toBe('new-user');
  });

  it('shows a login icon on the sign-in action', () => {
    const signIn = fixture.nativeElement.querySelector('.primary-action') as HTMLButtonElement;

    expect(signIn.querySelector('svg')).toBeTruthy();
  });

  it('loads safe role choices and submits the selected role during registration', () => {
    fixture.componentInstance.toggleMode();
    fixture.detectChanges();

    const roleSelect = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;
    expect(roleSelect).toBeTruthy();
    expect(Array.from(roleSelect.options).map((option) => option.value)).toEqual(['USER']);
    expect(fixture.nativeElement.textContent).toContain('Administrator access is managed separately.');

    auth.register.mockReturnValue(of({}));
    fixture.componentInstance.username = 'existing-user';
    fixture.componentInstance.email = 'existing@example.com';
    fixture.componentInstance.password = 'password123';

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(auth.register).toHaveBeenCalledWith('existing-user', 'existing@example.com', 'password123', 'USER');
    expect(fixture.componentInstance.mode).toBe('login');
  });

  it('keeps the team-member option selectable when the backend role list is unavailable', () => {
    getRegistrationRoles.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    fixture.componentInstance.toggleMode();
    fixture.detectChanges();

    const roleSelect = fixture.nativeElement.querySelector('#role') as HTMLSelectElement;
    expect(Array.from(roleSelect.options).map((option) => option.value)).toEqual(['USER']);
    expect(roleSelect.disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('You can continue as a team member.');

    auth.register.mockReturnValue(of({}));
    fixture.componentInstance.username = 'new-user';
    fixture.componentInstance.email = 'new@example.com';
    fixture.componentInstance.password = 'password123';
    fixture.componentInstance.submit();

    expect(auth.register).toHaveBeenCalledWith('new-user', 'new@example.com', 'password123', 'USER');
  });
});
