import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideBriefcase,
  LucideBuilding2,
  LucideDollarSign,
  LucideReceipt,
  LucideCalendarClock,
  LucideClipboardList,
  LucideShieldCheck
} from '@lucide/angular';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUsers,
    LucideBriefcase,
    LucideBuilding2,
    LucideDollarSign,
    LucideReceipt,
    LucideCalendarClock,
    LucideClipboardList,
    LucideShieldCheck
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {}
