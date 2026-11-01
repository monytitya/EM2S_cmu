import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Api } from '../../../services/api';
import { Auth } from '../../../services/auth';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;
  let updateCurrentProfile: ReturnType<typeof vi.fn>;
  const profile = {
    id: 8,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    isActive: true,
  };

  beforeEach(async () => {
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
            getCurrentProfile: () => of(profile),
            updateCurrentProfile,
          },
        },
        { provide: Auth, useValue: { updateToken: vi.fn(), setProfile: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('opens the account editor and saves the signed-in profile', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.profile')?.click();
    fixture.detectChanges();

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
