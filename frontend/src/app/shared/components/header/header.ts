import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  navLinks = [
    { path: '/inicio', label: 'Inicio' },
    { path: '/jornadas', label: 'Jornadas' },
    { path: '/posiciones', label: 'Posiciones' },
    { path: '/comunidad', label: 'Comunidad' }
  ];
}
