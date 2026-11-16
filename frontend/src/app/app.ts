import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, BottomNavComponent],
  template: `
    <app-header *ngIf="isPublicPage()"></app-header>
    <main class="page-container" [class.no-nav]="!isPublicPage()">
      <router-outlet></router-outlet>
    </main>
    <app-bottom-nav *ngIf="isPublicPage()"></app-bottom-nav>
  `,
  styles: [`
    .page-container.no-nav {
      padding: 0 !important;
      margin: 0 !important;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class App {
  private router = inject(Router);
  isPublicPage = signal<boolean>(true);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      const isStandaloneRoute = url.startsWith('/login') || url.startsWith('/admin') || url.startsWith('/representante');
      this.isPublicPage.set(!isStandaloneRoute);
    });
  }
}