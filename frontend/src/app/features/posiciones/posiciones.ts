import {
  Component,
  OnInit,
  HostListener,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { TorneoService } from '../../core/services';
import { PosicionTabla } from '../../core/models';
import { LandingFooterComponent } from '../inicio/components/landing-footer/landing-footer';

export interface TemporadaInfo {
  id: string;
  nombre: string;
  torneo: string;
  jornadaCorte: string;
  activo: boolean;
}

@Component({
  selector: 'app-posiciones',
  standalone: true,
  imports: [CommonModule, LandingFooterComponent],
  templateUrl: './posiciones.html',
  styleUrls: ['./posiciones.scss']
})
export class PosicionesComponent implements OnInit {
  private torneoService = inject(TorneoService);

  readonly temporadas: TemporadaInfo[] = [
    {
      id: '2026-apertura',
      nombre: 'Temporada 2026',
      torneo: 'Torneo Apertura 2026',
      jornadaCorte: 'Jornada 5',
      activo: true
    },
    {
      id: '2025-clausura',
      nombre: 'Temporada 2025',
      torneo: 'Torneo Clausura 2025',
      jornadaCorte: 'Finalizado (J11)',
      activo: false
    },
    {
      id: '2025-apertura',
      nombre: 'Temporada 2024-2025',
      torneo: 'Torneo Apertura 2024',
      jornadaCorte: 'Finalizado (J11)',
      activo: false
    }
  ];

  selectedSeason = signal<TemporadaInfo>(this.temporadas[0]);
  isSeasonDropdownOpen = signal<boolean>(false);
  posiciones = signal<PosicionTabla[]>([]);
  isLoading = signal<boolean>(true);

  // Estadísticas rápidas computadas
  lider = computed<PosicionTabla | null>(() => {
    const list = this.posiciones();
    return list.length > 0 ? list[0] : null;
  });

  totalGoles = computed<number>(() => {
    return this.posiciones().reduce((acc, curr) => acc + (curr.gf || 0), 0);
  });

  ngOnInit(): void {
    this.cargarPosiciones();
  }

  cargarPosiciones(): void {
    this.isLoading.set(true);
    this.torneoService.getPosiciones().pipe(take(1)).subscribe({
      next: (data) => {
        // Si es la temporada actual, usamos los datos reales/mock
        if (this.selectedSeason().id === '2026-apertura') {
          this.posiciones.set(data);
        } else {
          // Generar vista histórica ordenada para temporadas pasadas
          const historico = [...data].reverse().map((item, idx) => ({
            ...item,
            posicion: idx + 1,
            pj: 11,
            pg: Math.max(1, 10 - idx),
            pp: idx,
            pts: Math.max(3, (10 - idx) * 3)
          }));
          this.posiciones.set(historico);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isSeasonDropdownOpen.update(v => !v);
  }

  selectSeason(season: TemporadaInfo, event: Event): void {
    event.stopPropagation();
    this.selectedSeason.set(season);
    this.isSeasonDropdownOpen.set(false);
    this.cargarPosiciones();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isSeasonDropdownOpen()) {
      this.isSeasonDropdownOpen.set(false);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isSeasonDropdownOpen()) {
      this.isSeasonDropdownOpen.set(false);
    }
  }
}
