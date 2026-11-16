import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { AuthService, TorneoService } from '../../core/services';
import { PosicionTabla, Jornada, Partido } from '../../core/models';
import { AdminRegistrarPartidoComponent } from './components/admin-registrar-partido/admin-registrar-partido';
import { AdminProgramarCalendarioComponent } from './components/admin-programar-calendario/admin-programar-calendario';
import { AdminEquiposComponent } from './components/admin-equipos/admin-equipos';
import { AdminJugadorasComponent } from './components/admin-jugadoras/admin-jugadoras';
import { AdminEntrenadoresComponent } from './components/admin-entrenadores/admin-entrenadores';
import { AdminGeneradorIgComponent } from './components/admin-generador-ig/admin-generador-ig';

export interface ServiceCardItem {
  id: string;
  category: 'torneo' | 'comunidad';
  categoryLabel: string;
  icon: string;
  iconClass: string;
  title: string;
  desc: string;
}

interface ModalMeta {
  title: string;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminRegistrarPartidoComponent,
    AdminProgramarCalendarioComponent,
    AdminEquiposComponent,
    AdminJugadorasComponent,
    AdminEntrenadoresComponent,
    AdminGeneradorIgComponent
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private torneoService = inject(TorneoService);

  // Estados del widget de resumen de tabla y partidos
  topPosiciones = signal<PosicionTabla[]>([]);
  proximaJornada = signal<Jornada | null>(null);
  partidosProximos = signal<Partido[]>([]);
  currentMatchIndex = signal<number>(0);

  currentMatch = computed(() => {
    const list = this.partidosProximos();
    const idx = this.currentMatchIndex();
    return list[idx] || null;
  });

  // Filtro de categorías de servicios ('todos' | 'torneo' | 'comunidad')
  activeCategory = signal<'todos' | 'torneo' | 'comunidad'>('todos');

  // Catálogo completo de servicios del panel
  readonly servicesList: ServiceCardItem[] = [
    {
      id: 'registrar-partido',
      category: 'torneo',
      categoryLabel: 'Torneo y Cancha',
      icon: 'match',
      iconClass: 'icon-match',
      title: 'Registrar Partido',
      desc: 'Captura de cédula dominical, goles, incidencias, actas físicas con IA y dictado por voz en tiempo real.'
    },
    {
      id: 'programar-calendario',
      category: 'torneo',
      categoryLabel: 'Torneo y Cancha',
      icon: 'calendar',
      iconClass: 'icon-calendar',
      title: 'Programar Calendario',
      desc: 'Diseño y programación del rol todos contra todos en 11 fechas, canchas asignadas y horarios dominicales.'
    },
    {
      id: 'equipos',
      category: 'torneo',
      categoryLabel: 'Torneo y Cancha',
      icon: 'teams',
      iconClass: 'icon-teams',
      title: 'Equipos',
      desc: 'Gestión de los 11 clubes oficiales, escudos, videos destacados, capitanas y colores de juego.'
    },
    {
      id: 'jugadoras',
      category: 'torneo',
      categoryLabel: 'Torneo y Cancha',
      icon: 'players',
      iconClass: 'icon-players',
      title: 'Jugadoras',
      desc: 'Planteles oficiales por equipo, altas, bajas, modo Ghost Player y bolsa de solicitudes libres con asignación directa.'
    },
    {
      id: 'entrenadores',
      category: 'comunidad',
      categoryLabel: 'Servicios & Comunidad',
      icon: 'coach',
      iconClass: 'icon-coach',
      title: 'Entrenadores',
      desc: 'Catálogo de staff de acondicionamiento físico a domicilio, zonas CDMX, tarifas y disponibilidad horaria semanal.'
    },
    {
      id: 'generador-ig',
      category: 'comunidad',
      categoryLabel: 'Servicios & Comunidad',
      icon: 'social',
      iconClass: 'icon-social',
      title: 'Generador de Contenido IG',
      desc: 'Generación automática de la lámina oficial con los 6 resultados dominicales y escudos de clubes lista para Instagram.'
    }
  ];

  filteredServices = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'todos') {
      return this.servicesList;
    }
    return this.servicesList.filter(s => s.category === cat);
  });

  categoryCounts = computed(() => ({
    todos: this.servicesList.length,
    torneo: this.servicesList.filter(s => s.category === 'torneo').length,
    comunidad: this.servicesList.filter(s => s.category === 'comunidad').length
  }));

  setCategory(category: 'todos' | 'torneo' | 'comunidad'): void {
    this.activeCategory.set(category);
  }

  // Estado del modal dinámico activo
  activeModal = signal<string | null>(null);
  selectedInitialMatchId = signal<number | null>(null);

  modalMetadata: Record<string, ModalMeta> = {
    'registrar-partido': {
      title: 'Registrar Partido & Mesa de Control',
      desc: 'Cédula dominical, goles, incidencias, escaneo inteligente con IA y dictado por voz.',
      icon: 'match'
    },
    'programar-calendario': {
      title: 'Programar Calendario (Fixture)',
      desc: 'Diseño y programación del rol todos contra todos en 11 fechas dominicales.',
      icon: 'calendar'
    },
    'equipos': {
      title: 'Gestión de Equipos Oficiales',
      desc: 'Administración de los 11 clubes oficiales, escudos, videos y capitanas.',
      icon: 'teams'
    },
    'jugadoras': {
      title: 'Jugadoras & Bolsa de Solicitudes',
      desc: 'Planteles por club, modo Ghost Player confidencial y asignación directa de solicitudes libres.',
      icon: 'players'
    },
    'entrenadores': {
      title: 'Catálogo de Entrenadores',
      desc: 'Staff de acondicionamiento físico, bio, tarifas por sesión y disponibilidad semanal.',
      icon: 'coach'
    },
    'generador-ig': {
      title: 'Generador de Contenido IG',
      desc: 'Estudio de arte oficial con los 6 resultados dominicales listos para Instagram.',
      icon: 'social'
    }
  };

  currentModalData = computed(() => {
    const key = this.activeModal();
    return key ? this.modalMetadata[key] || null : null;
  });

  // Control de autoplay del carrusel de partidos
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  private isCarouselPaused = false;

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngOnDestroy(): void {
    this.stopCarouselAutoplay();
  }

  cargarDatosDashboard(): void {
    // 1. Cargar Top de la tabla de posiciones (primeros 4)
    this.torneoService.getPosiciones().pipe(take(1)).subscribe(data => {
      this.topPosiciones.set(data.slice(0, 4));
    });

    // 2. Cargar partidos de la jornada actual/próxima
    this.torneoService.getJornadaActual().pipe(take(1)).subscribe(jornada => {
      this.proximaJornada.set(jornada);
      if (jornada?.partidos && jornada.partidos.length > 0) {
        this.partidosProximos.set(jornada.partidos);
        this.startCarouselAutoplay();
      }
    });
  }

  startCarouselAutoplay(): void {
    this.stopCarouselAutoplay();
    this.carouselInterval = setInterval(() => {
      if (!this.isCarouselPaused && this.partidosProximos().length > 1) {
        this.nextMatch();
      }
    }, 4000); // Avanza automáticamente cada 4 segundos
  }

  stopCarouselAutoplay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  pauseCarousel(): void {
    this.isCarouselPaused = true;
  }

  resumeCarousel(): void {
    this.isCarouselPaused = false;
  }

  nextMatch(): void {
    const total = this.partidosProximos().length;
    if (total <= 1) return;
    if (this.currentMatchIndex() < total - 1) {
      this.currentMatchIndex.update(idx => idx + 1);
    } else {
      this.currentMatchIndex.set(0); // Ciclo continuo automático
    }
  }

  prevMatch(): void {
    const total = this.partidosProximos().length;
    if (total <= 1) return;
    if (this.currentMatchIndex() > 0) {
      this.currentMatchIndex.update(idx => idx - 1);
    } else {
      this.currentMatchIndex.set(total - 1);
    }
  }

  openModal(modalKey: string, match?: Partido): void {
    this.selectedInitialMatchId.set(match ? match.id : null);
    this.activeModal.set(modalKey);
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.selectedInitialMatchId.set(null);
  }

  onLogout(): void {
    this.authService.logout();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.activeModal()) {
      this.closeModal();
    }
  }
}
