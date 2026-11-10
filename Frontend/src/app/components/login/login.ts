import { HttpErrorResponse } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideLogIn } from '@lucide/angular';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  imports: [FormsModule, NgFor, NgIf, LucideLogIn],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  username = '';
  email = '';
  password = '';
  role = 'USER';
  registrationRoles: string[] = [];
  rolesLoading = false;
  roleLoadWarning = '';
  mode: 'login' | 'register' = 'login';
  error = '';
  success = '';
  submitting = false;
  showRegistrationAction = false;

  toggleMode(): void {
    this.error = '';
    this.success = '';
    this.showRegistrationAction = false;
    this.mode = this.mode === 'login' ? 'register' : 'login';
    if (this.mode === 'register' && !this.registrationRoles.length) {
      this.loadRegistrationRoles();
    }
  }

  private loadRegistrationRoles(): void {
    this.rolesLoading = true;
    this.api.getRegistrationRoles().subscribe({
      next: (roles) => {
        this.registrationRoles = roles
          .filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
          .map((role) => role.trim().toUpperCase())
          .filter((role, index, availableRoles) => role !== 'ADMIN' && availableRoles.indexOf(role) === index);
        if (!this.registrationRoles.length) {
          this.useDefaultRegistrationRole();
        } else {
          if (!this.registrationRoles.includes(this.role)) this.role = this.registrationRoles[0];
          this.roleLoadWarning = '';
        }
        this.rolesLoading = false;
      },
      error: () => {
        this.useDefaultRegistrationRole();
        this.rolesLoading = false;
      },
    });
  }

  private useDefaultRegistrationRole(): void {
    this.registrationRoles = ['USER'];
    this.role = 'USER';
    this.roleLoadWarning = 'Role options are unavailable. You can continue as a team member.';
  }

  submit(): void {
    const trimmedUsername = this.username.trim();
    const trimmedEmail = this.email.trim();

    if (this.mode === 'register') {
      if (!trimmedUsername || !trimmedEmail || !this.password || !this.registrationRoles.includes(this.role)) {
        this.error = 'Enter username, email, password, and select an available role.';
        return;
      }

      this.error = '';
      this.success = '';
      this.showRegistrationAction = false;
      this.submitting = true;
      this.auth.register(trimmedUsername, trimmedEmail, this.password, this.role).subscribe({
        next: () => {
          this.submitting = false;
          this.mode = 'login';
          this.password = '';
          this.success = 'Account created. Sign in with your new credentials.';
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getApiError(error) || 'Registration failed. Please try again.';
          this.showRegistrationAction = false;
          this.submitting = false;
        },
      });
      return;
    }

    if (!trimmedUsername || !this.password) {
      this.error = 'Enter your username and password.';
      return;
    }
    this.error = '';
    this.success = '';
    this.showRegistrationAction = false;
    this.submitting = true;
    this.auth.login(trimmedUsername, this.password).subscribe({
      next: ({ jwt }) => {
        this.auth.setToken(jwt);
        this.submitting = false;
        void this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.status === 401
          ? 'We could not verify this sign-in. Check your username and password, or create an account.'
          : this.getApiError(error) || 'Login failed. Please try again.';
        this.showRegistrationAction = error.status === 401;
        this.submitting = false;
      },
    });
  }

  private getApiError(error: HttpErrorResponse): string | undefined {
    const message = error.error?.message || error.error?.error;
    return typeof message === 'string' ? message : undefined;
  }
}
