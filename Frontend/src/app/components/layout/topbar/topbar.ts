import { Component } from '@angular/core';
import { LucideSearch, LucideBell, LucideChevronDown } from '@lucide/angular';

@Component({
  imports: [LucideSearch, LucideBell, LucideChevronDown],
  selector: 'app-topbar',
  styleUrl: './topbar.css',
  templateUrl: './topbar.html',
})
export class Topbar {}
