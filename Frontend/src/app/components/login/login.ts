import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  imports: [FormsModule, NgIf],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  username = '';
  email = '';
  password = '';
  role = 'USER';
  mode: 'login' | 'register' = 'login';
  error = '';
  submitting = false;

  toggleMode(): void {
    this.error = '';
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  submit(): void {
    const trimmedUsername = this.username.trim();
    const trimmedEmail = this.email.trim();

    if (this.mode === 'register') {
      if (!trimmedUsername || !trimmedEmail || !this.password) {
        this.error = 'Enter username, email, and password to register.';
        return;
      }

      this.error = '';
      this.submitting = true;
      this.auth.register(trimmedUsername, trimmedEmail, this.password, this.role).subscribe({
        next: ({ jwt }) => {
          this.auth.setToken(jwt);
          this.submitting = false;
          void this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error = 'Registration failed. Please try a different username or email.';
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
    this.submitting = true;
    this.auth.login(trimmedUsername, this.password).subscribe({
      next: ({ jwt }) => {
        this.auth.setToken(jwt);
        this.submitting = false;
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Login failed. Check your credentials and try again.';
        this.submitting = false;
      },
    });
  }
}
