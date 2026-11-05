import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ghost-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ghost-avatar.html',
  styleUrls: ['./ghost-avatar.scss']
})
export class GhostAvatarComponent {
  @Input() fotoUrl: string | null = null;
  @Input() autorizaImagen: boolean = false;
  @Input() dorsal: number | null = null;
  @Input() nombre: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get initial(): string {
    return this.nombre ? this.nombre.charAt(0).toUpperCase() : '#';
  }
}
