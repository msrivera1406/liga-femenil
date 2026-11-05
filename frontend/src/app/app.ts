import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, BottomNavComponent],
  template: `
    <app-header></app-header>
    <main class="page-container">
      <router-outlet></router-outlet>
    </main>
    <app-bottom-nav></app-bottom-nav>
  `
})
export class App {}