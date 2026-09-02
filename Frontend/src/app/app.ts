import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './components/layout/sidebar/sidebar';
import { Topbar } from './components/layout/topbar/topbar';

@Component({
  imports: [RouterOutlet, Sidebar, Topbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly router = inject(Router);
  protected readonly title = signal('frontend');
}
