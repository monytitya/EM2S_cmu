import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api } from '../../../services/api';
import { Auth } from '../../../services/auth';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;
  let getCurrentProfile: ReturnType<typeof vi.fn>;
  let updateCurrentProfile: ReturnType<typeof vi.fn>;
  let logout: ReturnType<typeof vi.fn>;
  const profile = {
    id: 8,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    isActive: true,
  };

  beforeEach(async () => {
    getCurrentProfile = vi.fn(() => of(profile));
    logout = vi.fn();
    updateCurrentProfile = vi.fn((update: { username: string; email: string; password?: string }) =>
      of({ ...profile, ...update, jwt: 'updated-token' }),
    );
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        {
          provide: Api,
          useValue: {
            getCurrentProfile,
            updateCurrentProfile,
          },
        },
        { provide: Auth, useValue: { updateToken: vi.fn(), setProfile: vi.fn(), logout } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows an icon sign-out action that logs out', () => {
    fixture.detectChanges();
    const signOut = fixture.nativeElement.querySelector('.auth-action') as HTMLButtonElement;

    expect(signOut.textContent).toContain('Sign out');
    expect(signOut.querySelector('svg')).toBeTruthy();
    signOut.click();

    expect(logout).toHaveBeenCalledOnce();
  });

  it('opens the account editor and saves the signed-in profile', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(getCurrentProfile).not.toHaveBeenCalled();
    element.querySelector<HTMLButtonElement>('.profile')?.click();
    fixture.detectChanges();

    expect(getCurrentProfile).toHaveBeenCalledTimes(1);
    expect(element.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.componentInstance.profileForm.email).toBe('admin@example.com');

    fixture.componentInstance.profileForm.username = 'manager';
    fixture.componentInstance.profileForm.email = 'manager@example.com';
    fixture.componentInstance.saveProfile();
    fixture.detectChanges();

    expect(updateCurrentProfile).toHaveBeenCalledWith({
      username: 'manager',
      email: 'manager@example.com',
    });
    expect(fixture.componentInstance.profile?.username).toBe('manager');
    expect(fixture.componentInstance.profileSuccess).toBe('Your account details have been updated.');
  });
});
