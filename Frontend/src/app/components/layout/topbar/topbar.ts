import { Component, inject } from '@angular/core';
import { LucideSearch, LucideBell, LucideChevronDown } from '@lucide/angular';
import { Auth } from '../../../services/auth';

@Component({
  imports: [LucideSearch, LucideBell, LucideChevronDown],
  selector: 'app-topbar',
  styleUrl: './topbar.css',
  templateUrl: './topbar.html',
})
export class Topbar {
  private readonly auth = inject(Auth);
  username = 'Admin Manager';
  initials = 'AM';

  constructor() {
    this.auth.profile$.subscribe((profile) => {
      if (!profile) return;
      this.username = profile.username;
      this.initials = profile.username.slice(0, 2).toUpperCase();
    });
  }
}
