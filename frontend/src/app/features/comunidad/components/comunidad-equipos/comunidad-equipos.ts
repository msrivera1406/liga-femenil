import {
  Component,
  OnInit,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { EquiposService, JugadorasService, TorneoService } from '../../../../core/services';
import { Equipo, JugadoraPublica, PosicionTabla } from '../../../../core/models';

export interface RosterPorLineas {
  porteras: JugadoraPublica[];
  defensas: JugadoraPublica[];
  medios: JugadoraPublica[];
  delanteras: JugadoraPublica[];
}

@Component({
  selector: 'app-comunidad-equipos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comunidad-equipos.html',
  styleUrls: ['./comunidad-equipos.scss']
})
export class ComunidadEquiposComponent implements OnInit {
  private equiposService = inject(EquiposService);
  private jugadorasService = inject(JugadorasService);
  private torneoService = inject(TorneoService);

  // Estados reactivos
  equipos = signal<Equipo[]>([]);
  posicionesMap = signal<Map<number, PosicionTabla>>(new Map());
  
  // Modal de Equipo seleccionado
  selectedEquipo = signal<Equipo | null>(null);
  selectedEquipoStats = signal<PosicionTabla | null>(null);
  selectedEquipoRoster = signal<RosterPorLineas>({
    porteras: [],
    defensas: [],
    medios: [],
    delanteras: []
  });
  isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // 1. Cargar equipos
    this.equiposService.getEquipos().pipe(take(1)).subscribe(data => {
      this.equipos.set(data);
    });

    // 2. Cargar tabla de posiciones para alimentar stats de cada equipo
    this.torneoService.getPosiciones().pipe(take(1)).subscribe(data => {
      const map = new Map<number, PosicionTabla>();
      data.forEach(item => map.set(item.equipo_id, item));
      this.posicionesMap.set(map);
    });
  }

  // Abrir Modal de Equipo
  openTeamModal(equipo: Equipo): void {
    this.selectedEquipo.set(equipo);
    
    // Obtener estadísticas del equipo
    const stats = this.posicionesMap().get(equipo.id) || null;
    this.selectedEquipoStats.set(stats);

    // Cargar alineaciones/jugadoras del equipo
    this.jugadorasService.getJugadorasByEquipo(equipo.id).pipe(take(1)).subscribe(jugadoras => {
      const plantel = jugadoras;
      
      this.selectedEquipoRoster.set({
        porteras: plantel.filter(j => j.posicion === 'Portera'),
        defensas: plantel.filter(j => j.posicion === 'Defensa'),
        medios: plantel.filter(j => j.posicion === 'Medio'),
        delanteras: plantel.filter(j => j.posicion === 'Delantera')
      });
      this.isModalOpen.set(true);
    });
  }

  closeTeamModal(): void {
    this.isModalOpen.set(false);
    this.selectedEquipo.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isModalOpen()) {
      this.closeTeamModal();
    }
  }

}
