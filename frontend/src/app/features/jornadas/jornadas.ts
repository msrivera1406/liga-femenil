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
import { Jornada, Partido } from '../../core/models';
import { LandingFooterComponent } from '../inicio/components/landing-footer/landing-footer';

@Component({
  selector: 'app-jornadas',
  standalone: true,
  imports: [CommonModule, LandingFooterComponent],
  templateUrl: './jornadas.html',
  styleUrls: ['./jornadas.scss']
})
export class JornadasComponent implements OnInit {
  private torneoService = inject(TorneoService);

  jornadas = signal<Jornada[]>([]);
  currentIndex = signal<number>(4); // Default: Jornada 5 (índice 4)
  readonly JORNADA_ACTUAL_NUMERO = 5;

  selectedMatch = signal<Partido | null>(null);
  mobileMatchTab = signal<'first' | 'second' | 'all'>('first');

  isFirstJornada = computed<boolean>(() => this.currentIndex() <= 0);
  isLastJornada = computed<boolean>(() => {
    const list = this.jornadas();
    return list.length === 0 || this.currentIndex() >= list.length - 1;
  });

  currentJornada = computed<Jornada | null>(() => {
    const list = this.jornadas();
    if (list.length === 0) return null;
    return list[this.currentIndex()] || null;
  });

  prevJornada = computed<Jornada | null>(() => {
    const list = this.jornadas();
    const idx = this.currentIndex();
    if (idx <= 0 || list.length <= 1) return null;
    return list[idx - 1] || null;
  });

  nextJornada = computed<Jornada | null>(() => {
    const list = this.jornadas();
    const idx = this.currentIndex();
    if (idx >= list.length - 1 || list.length <= 1) return null;
    return list[idx + 1] || null;
  });

  isViewingActual = computed<boolean>(() => {
    const current = this.currentJornada();
    return current?.numero_jornada === this.JORNADA_ACTUAL_NUMERO;
  });

  ngOnInit(): void {
    this.torneoService.getJornadas().pipe(take(1)).subscribe(data => {
      this.jornadas.set(data);
      // Localizar el índice de la jornada actual (J5)
      const actualIdx = data.findIndex(j => j.numero_jornada === this.JORNADA_ACTUAL_NUMERO);
      if (actualIdx !== -1) {
        this.currentIndex.set(actualIdx);
      }
    });
  }

  setMobileMatchTab(tab: 'first' | 'second' | 'all'): void {
    this.mobileMatchTab.set(tab);
  }

  goToJornada(index: number): void {
    if (index >= 0 && index < this.jornadas().length) {
      this.currentIndex.set(index);
      this.mobileMatchTab.set('first');
    }
  }

  goToActual(): void {
    const actualIdx = this.jornadas().findIndex(j => j.numero_jornada === this.JORNADA_ACTUAL_NUMERO);
    if (actualIdx !== -1) {
      this.currentIndex.set(actualIdx);
      this.mobileMatchTab.set('first');
    }
  }

  goNext(): boolean {
    const total = this.jornadas().length;
    if (this.currentIndex() < total - 1) {
      this.currentIndex.update(curr => curr + 1);
      this.mobileMatchTab.set('first');
      return true;
    }
    return false;
  }

  goPrev(): boolean {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(curr => curr - 1);
      this.mobileMatchTab.set('first');
      return true;
    }
    return false;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.selectedMatch() && event.key === 'Escape') {
      this.closeMatchModal();
    }
  }

  openMatchModal(partido: Partido): void {
    this.selectedMatch.set(partido);
  }

  closeMatchModal(): void {
    this.selectedMatch.set(null);
  }

  formatFechaLarga(fechaStr: string | undefined): string {
    if (!fechaStr) return '';
    try {
      const parts = fechaStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return fechaStr;
    }
  }

  getThreePreviewMatches(jornada: Jornada | null): Partido[] {
    if (!jornada?.partidos) return [];
    return jornada.partidos.slice(0, 3);
  }
}
