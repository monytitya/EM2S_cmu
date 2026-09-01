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
  password = '';
  error = '';
  submitting = false;

  submit(): void {
    if (!this.username.trim() || !this.password) {
      this.error = 'Enter your username and password.';
      return;
    }
    this.error = '';
    this.submitting = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: ({ jwt }) => { this.auth.setToken(jwt); void this.router.navigate(['/dashboard']); },
      error: () => { this.error = 'Login failed. Check your credentials and try again.'; this.submitting = false; },
    });
  }
}
