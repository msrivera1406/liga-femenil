import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, TorneoService, EquiposService, JugadorasService } from '../../core/services';
import { PosicionTabla, Jornada, Partido, Equipo } from '../../core/models';
import { RepClubComponent } from './components/rep-club/rep-club';
import { RepJugadorasComponent } from './components/rep-jugadoras/rep-jugadoras';

export interface RepServiceItem {
  id: 'club' | 'jugadoras';
  categoryLabel: string;
  title: string;
  desc: string;
}

export interface GoleadoraClub {
  jugadoraId: number;
  nombre: string;
  dorsal: number | null;
  posicion: string;
  foto_url: string | null;
  goles: number;
  partidosConGol: number;
}

export interface AmonestadaClub {
  jugadoraId: number;
  nombre: string;
  dorsal: number | null;
  posicion: string;
  amarillas: number;
  rojas: number;
}

@Component({
  selector: 'app-representante',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RepClubComponent, RepJugadorasComponent],
  templateUrl: './representante.html',
  styleUrls: ['./representante.scss']
})
export class RepresentanteComponent implements OnInit {
  authService = inject(AuthService);
  private torneoService = inject(TorneoService);
  private equiposService = inject(EquiposService);
  private jugadorasService = inject(JugadorasService);

  // Identificador del club: de la sesión autenticada o 1 (Amazonas CDMX por defecto para demo)
  miEquipoId = computed<number>(() => {
    return this.authService.currentUser()?.equipo_id || 1;
  });

  // Datos reactivos del club en sesión
  miEquipo = signal<Equipo | null>(null);
  posiciones = signal<PosicionTabla[]>([]);
  jornadas = signal<Jornada[]>([]);
  selectedJornadaIndex = signal<number>(0);
  totalJugadoras = signal<number>(0);
  isLoading = signal<boolean>(true);

  // Posición del equipo en la tabla
  miPosicion = computed<PosicionTabla | null>(() => {
    const eqId = this.miEquipoId();
    const list = this.posiciones();
    return list.find(p => p.equipo_id === eqId) || null;
  });

  // Jornada activa en el selector
  currentJornada = computed<Jornada | null>(() => {
    const list = this.jornadas();
    const idx = this.selectedJornadaIndex();
    return list[idx] || null;
  });

  // Partido exclusivo de este equipo en la jornada seleccionada
  partidoDeMiEquipo = computed<Partido | null>(() => {
    const j = this.currentJornada();
    if (!j || !j.partidos || j.partidos.length === 0) return null;
    const eqId = this.miEquipoId();
    return j.partidos.find(p => 
      p.equipo_local_id === eqId || 
      p.equipo_visitante_id === eqId ||
      p.equipo_local?.id === eqId ||
      p.equipo_visitante?.id === eqId
    ) || null;
  });

  // Determina si el equipo juega como local en este partido
  esLocal = computed<boolean>(() => {
    const p = this.partidoDeMiEquipo();
    if (!p) return false;
    const eqId = this.miEquipoId();
    return p.equipo_local_id === eqId || p.equipo_local?.id === eqId;
  });

  // Catálogo de los 2 módulos de gestión para el representante
  readonly servicesList: RepServiceItem[] = [
    {
      id: 'club',
      categoryLabel: 'Identidad Institucional',
      title: 'Mi Club y Escudo',
      desc: 'Actualiza el nombre oficial del equipo, escudo de juego, colores representativos, video de presentación y enlaces de contacto.'
    },
    {
      id: 'jugadoras',
      categoryLabel: 'Plantel Deportivo',
      title: 'Plantel de Jugadoras',
      desc: 'Consulta las jugadoras registradas en tu equipo, asigna números de dorsal, actualiza fotos de perfil y revisa sus fichas deportivas.'
    }
  ];

  // ==============================================
  // ESTADÍSTICAS OFICIALES DEL CLUB
  // ==============================================
  statsGolesFavor = computed<number>(() => {
    return this.miPosicion()?.gf ?? 15;
  });

  statsGolesContra = computed<number>(() => {
    return this.miPosicion()?.gc ?? 4;
  });

  statsPromedioGf = computed<string>(() => {
    const gf = this.statsGolesFavor();
    const pj = this.miPosicion()?.pj || 4;
    return (gf / Math.max(pj, 1)).toFixed(1);
  });

  statsPromedioGc = computed<string>(() => {
    const gc = this.statsGolesContra();
    const pj = this.miPosicion()?.pj || 4;
    return (gc / Math.max(pj, 1)).toFixed(1);
  });

  statsVallasInvictas = computed<number>(() => {
    return 2;
  });

  // Ranking interno de goleadoras del club
  clubGoleadoras = computed<GoleadoraClub[]>(() => {
    const eqId = this.miEquipoId();
    if (eqId === 1) {
      return [
        {
          jugadoraId: 1,
          nombre: 'Valeria "La Rusa"',
          dorsal: 10,
          posicion: 'Delantera',
          foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          goles: 7,
          partidosConGol: 4
        },
        {
          jugadoraId: 3,
          nombre: 'Camila Ríos',
          dorsal: 7,
          posicion: 'Medio',
          foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
          goles: 5,
          partidosConGol: 3
        },
        {
          jugadoraId: 4,
          nombre: 'Lucía "Muro" Morales',
          dorsal: 4,
          posicion: 'Defensa',
          foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
          goles: 2,
          partidosConGol: 2
        }
      ];
    }
    const gf = this.statsGolesFavor();
    return [
      {
        jugadoraId: 101,
        nombre: 'Goleadora Principal',
        dorsal: 9,
        posicion: 'Delantera',
        foto_url: null,
        goles: Math.max(1, Math.round(gf * 0.55)),
        partidosConGol: Math.min(3, this.miPosicion()?.pj || 3)
      },
      {
        jugadoraId: 102,
        nombre: 'Segunda Anotadora',
        dorsal: 11,
        posicion: 'Medio',
        foto_url: null,
        goles: Math.max(1, Math.round(gf * 0.3)),
        partidosConGol: 2
      }
    ];
  });

  // Amonestaciones y estatus disciplinario del club
  clubAmonestadas = computed<AmonestadaClub[]>(() => {
    const eqId = this.miEquipoId();
    if (eqId === 1) {
      return [
        {
          jugadoraId: 4,
          nombre: 'Lucía "Muro" Morales',
          dorsal: 4,
          posicion: 'Defensa',
          amarillas: 1,
          rojas: 0
        },
        {
          jugadoraId: 3,
          nombre: 'Camila Ríos',
          dorsal: 7,
          posicion: 'Medio',
          amarillas: 1,
          rojas: 0
        }
      ];
    }
    return [
      {
        jugadoraId: 201,
        nombre: 'Jugadora Amonestada',
        dorsal: 4,
        posicion: 'Defensa',
        amarillas: 1,
        rojas: 0
      }
    ];
  });

  statsTotalAmarillas = computed<number>(() => {
    return this.clubAmonestadas().reduce((acc, curr) => acc + curr.amarillas, 0);
  });

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.isLoading.set(true);
    const eqId = this.miEquipoId();

    // 1. Cargar info del equipo
    this.equiposService.getEquipoById(eqId).subscribe({
      next: (eq) => {
        if (eq) {
          this.miEquipo.set(eq);
        } else {
          // Fallback buscando en la lista general
          this.equiposService.getEquipos().subscribe(equipos => {
            const found = equipos.find(e => e.id === eqId) || equipos[0] || null;
            this.miEquipo.set(found);
          });
        }
      },
      error: () => {
        this.equiposService.getEquipos().subscribe(equipos => {
          this.miEquipo.set(equipos[0] || null);
        });
      }
    });

    // 2. Cargar tabla de posiciones
    this.torneoService.getPosiciones().subscribe({
      next: (pos) => {
        this.posiciones.set(pos || []);
      }
    });

    // 3. Cargar jornadas y enfocar en la próxima fecha (Jornada 5)
    this.torneoService.getJornadas().subscribe({
      next: (jorns) => {
        const list = jorns || [];
        this.jornadas.set(list);

        // Buscar jornada activa (Jornada 5 o la primera no finalizada)
        const activeIdx = list.findIndex(j => j.numero_jornada === 5);
        if (activeIdx !== -1) {
          this.selectedJornadaIndex.set(activeIdx);
        } else {
          const firstPending = list.findIndex(j => j.partidos?.some(p => p.estado !== 'finalizado'));
          this.selectedJornadaIndex.set(firstPending !== -1 ? firstPending : 0);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // 4. Cargar total de jugadoras del equipo
    this.jugadorasService.getJugadorasByEquipo(eqId).subscribe({
      next: (jugs) => {
        this.totalJugadoras.set(jugs ? jugs.length : 0);
      }
    });
  }

  // Modal de servicio activo ('club' | 'jugadoras' | null)
  activeModal = signal<'club' | 'jugadoras' | null>(null);

  currentModalData = computed<RepServiceItem | null>(() => {
    const modal = this.activeModal();
    if (!modal) return null;
    return this.servicesList.find(s => s.id === modal) || null;
  });

  // Navegación de jornadas en el widget de partido del equipo
  prevJornada(): void {
    this.selectedJornadaIndex.update(idx => Math.max(0, idx - 1));
  }

  nextJornada(): void {
    const max = this.jornadas().length - 1;
    this.selectedJornadaIndex.update(idx => Math.min(max, idx + 1));
  }

  // Apertura y cierre de los módulos oficiales
  openService(serviceId: 'club' | 'jugadoras'): void {
    this.activeModal.set(serviceId);
  }

  closeModal(): void {
    this.activeModal.set(null);
  }

  // Callback cuando se actualiza la ficha del club
  onClubActualizado(updated: Equipo): void {
    this.miEquipo.set(updated);
    
    // Sincronizar nombre y escudo en la tabla de posiciones reactiva
    this.posiciones.update(list => list.map(p => {
      if (p.equipo_id === updated.id) {
        return {
          ...p,
          nombre_equipo: updated.nombre,
          escudo_url: updated.escudo_url
        };
      }
      return p;
    }));
  }

  onLogout(): void {
    this.authService.logout();
  }
}
