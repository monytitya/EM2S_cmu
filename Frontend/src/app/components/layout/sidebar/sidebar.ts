import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Api, AccountProfile } from '../../../services/api';
import { Auth } from '../../../services/auth';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideBriefcase,
  LucideBuilding2,
  LucideDollarSign,
  LucideReceipt,
  LucideCalendarClock,
  LucideClipboardList,
  LucideShieldCheck,
  LucideLogOut
} from '@lucide/angular';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    NgIf,
    LucideLayoutDashboard,
    LucideUsers,
    LucideBriefcase,
    LucideBuilding2,
    LucideDollarSign,
    LucideReceipt,
    LucideCalendarClock,
    LucideClipboardList,
    LucideShieldCheck,
    LucideLogOut
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);

  profile: AccountProfile | null = null;
  profileLoading = false;
  profileOpen = false;
  savingProfile = false;
  profileError = '';
  profileSuccess = '';
  profileLoadError = '';
  profileForm = { username: '', email: '', password: '' };

  openProfile(): void {
    this.profileError = this.profileLoadError;
    this.profileSuccess = '';
    this.profileForm = {
      username: this.profile?.username || '',
      email: this.profile?.email || '',
      password: '',
    };
    this.profileOpen = true;
    if (!this.profile && !this.profileLoading) this.loadProfile();
  }

  logout(): void {
    this.auth.logout();
  }

  closeProfile(): void {
    if (this.savingProfile) return;
    this.profileOpen = false;
    this.profileError = '';
  }

  saveProfile(): void {
    if (this.savingProfile || !this.profile) return;
    const username = this.profileForm.username.trim();
    const email = this.profileForm.email.trim();
    if (!username || !email) {
      this.profileError = 'Username and email are required.';
      return;
    }

    this.profileError = '';
    this.profileSuccess = '';
    this.savingProfile = true;
    const update: { username: string; email: string; password?: string } = { username, email };
    if (this.profileForm.password) update.password = this.profileForm.password;

    this.api.updateCurrentProfile(update).subscribe({
      next: (profile) => {
        this.auth.updateToken(profile.jwt);
        this.profile = profile;
        this.auth.setProfile(profile);
        this.profileForm.password = '';
        this.profileSuccess = 'Your account details have been updated.';
        this.savingProfile = false;
      },
      error: (error: HttpErrorResponse) => {
        this.profileError = error.status === 409
          ? String(error.error?.message || 'That username or email is already in use.')
          : String(error.error?.message || 'Unable to update your account. Please try again.');
        this.savingProfile = false;
      },
    });
  }

  private loadProfile(): void {
    this.profileLoading = true;
    this.api.getCurrentProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.auth.setProfile(profile);
        this.profileLoadError = '';
        if (this.profileOpen) {
          this.profileForm = {
            username: profile.username,
            email: profile.email,
            password: '',
          };
        }
        this.profileLoading = false;
      },
      error: () => {
        this.profileLoadError = 'Unable to load your account details. Check your connection and try again.';
        if (this.profileOpen) this.profileError = this.profileLoadError;
        this.profileLoading = false;
      },
    });
  }
}
