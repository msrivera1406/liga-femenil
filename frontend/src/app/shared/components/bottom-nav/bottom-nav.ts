import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: 'home' | 'calendar' | 'trophy' | 'community' | 'shield';
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.html',
  styleUrls: ['./bottom-nav.scss']
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { path: '/inicio', label: 'Inicio', icon: 'home' },
    { path: '/jornadas', label: 'Jornadas', icon: 'calendar' },
    { path: '/posiciones', label: 'Posiciones', icon: 'trophy' },
    { path: '/comunidad', label: 'Comunidad', icon: 'community' }
  ];
}