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
      // Si el mock tiene pocas jugadoras para este equipo, generamos un plantel completo realista
      const plantel = jugadoras.length >= 7 ? jugadoras : this.generarPlantelCompleto(equipo, jugadoras);
      
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

  // Generador de respaldo para asegurar que todos los 12 equipos tengan su alineación completa en 4 líneas
  private generarPlantelCompleto(equipo: Equipo, existentes: JugadoraPublica[]): JugadoraPublica[] {
    const defaultRoster: JugadoraPublica[] = [
      {
        id: equipo.id * 100 + 1,
        equipo_id: equipo.id,
        nombre_deportivo: `${equipo.nombre.split(' ')[0]} Guardiana`,
        pronombres: 'Ella',
        dorsal: 1,
        posicion: 'Portera',
        foto_url: null,
        autoriza_imagen: false, // Ghost player
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 2,
        equipo_id: equipo.id,
        nombre_deportivo: 'Marifer "Capi" R.',
        pronombres: 'Ella',
        dorsal: 4,
        posicion: 'Defensa',
        foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        autoriza_imagen: true,
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 3,
        equipo_id: equipo.id,
        nombre_deportivo: 'Pau Morales',
        pronombres: 'Ella/Elle',
        dorsal: 3,
        posicion: 'Defensa',
        foto_url: null,
        autoriza_imagen: false, // Ghost player
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 4,
        equipo_id: equipo.id,
        nombre_deportivo: 'Alejandra "Maga" Silva',
        pronombres: 'Ella',
        dorsal: 8,
        posicion: 'Medio',
        foto_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
        autoriza_imagen: true,
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 5,
        equipo_id: equipo.id,
        nombre_deportivo: 'Sam "Rayo" Cruz',
        pronombres: 'Elle',
        dorsal: 7,
        posicion: 'Medio',
        foto_url: null,
        autoriza_imagen: false, // Ghost player
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 6,
        equipo_id: equipo.id,
        nombre_deportivo: 'Lucía "Gol" Mendoza',
        pronombres: 'Ella',
        dorsal: 9,
        posicion: 'Delantera',
        foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        autoriza_imagen: true,
        es_independiente: false,
        activo: true
      },
      {
        id: equipo.id * 100 + 7,
        equipo_id: equipo.id,
        nombre_deportivo: 'Andrea "Chispa" V.',
        pronombres: 'Ella',
        dorsal: 11,
        posicion: 'Delantera',
        foto_url: null,
        autoriza_imagen: false, // Ghost player
        es_independiente: false,
        activo: true
      }
    ];

    if (existentes.length === 0) return defaultRoster;
    return [...existentes, ...defaultRoster.slice(existentes.length)];
  }
}
