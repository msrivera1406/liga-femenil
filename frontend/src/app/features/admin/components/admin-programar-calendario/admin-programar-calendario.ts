import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { TorneoService } from '../../../../core/services';
import { Jornada, Partido } from '../../../../core/models';

@Component({
  selector: 'app-admin-programar-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-programar-calendario.html',
  styleUrls: ['./admin-programar-calendario.scss']
})
export class AdminProgramarCalendarioComponent implements OnInit {
  private torneoService = inject(TorneoService);

  @Output() cerrar = new EventEmitter<void>();
  @Output() calendarioGuardado = new EventEmitter<void>();

  calJornadas = signal<Jornada[]>([]);
  calSelectedJornadaNum = signal<number>(5);
  calMatches = signal<Partido[]>([]);
  calHasChanges = signal<boolean>(false);
  calConflictsCount = signal<number>(0);
  calConflictTimes = signal<string[]>([]);
  calSuccessToast = signal<string | null>(null);
  calIsSaving = signal<boolean>(false);
  calFechaDomingo = signal<string>('2026-11-08');
  calJornadaPublicada = signal<boolean>(true);

  readonly allTimeSlotOptions: string[] = [
    '08:00',
    '09:15',
    '10:30',
    '11:45',
    '13:00',
    '14:15',
    '15:30',
    '16:45',
    '18:00'
  ];

  readonly standardTimeSlots: string[] = [
    '08:00',
    '09:15',
    '10:30',
    '11:45',
    '13:00',
    '14:15'
  ];

  calSelectedJornada = computed(() => {
    const list = this.calJornadas();
    if (list.length === 0) return null;
    const found = list.find(j => j.numero_jornada === this.calSelectedJornadaNum());
    return found || list[0];
  });

  calPartidos = computed(() => {
    return this.calMatches();
  });

  ngOnInit(): void {
    this.torneoService.getJornadas(1).pipe(take(1)).subscribe(jornadas => {
      this.calJornadas.set(jornadas);
      this.initCalendarForJornada();
    });
  }

  initCalendarForJornada(): void {
    const j = this.calSelectedJornada();
    if (j?.partidos) {
      const cloned: Partido[] = JSON.parse(JSON.stringify(j.partidos)).map((p: any, idx: number) => {
        if (!p.horario && p.hora) p.horario = p.hora;
        if (!p.horario) p.horario = this.standardTimeSlots[idx % this.standardTimeSlots.length];
        return p;
      });
      this.calMatches.set(cloned);
      this.calFechaDomingo.set(j.fecha_domingo || '2026-11-08');
      this.calHasChanges.set(false);
      this.checkCalendarConflicts();
    }
  }

  selectCalJornada(num: number): void {
    this.calSelectedJornadaNum.set(num);
    this.initCalendarForJornada();
  }

  prevCalJornada(): void {
    const list = this.calJornadas();
    if (list.length <= 1) return;
    const curNum = this.calSelectedJornadaNum();
    const curIdx = list.findIndex(j => j.numero_jornada === curNum);
    if (curIdx > 0) {
      this.selectCalJornada(list[curIdx - 1].numero_jornada);
    } else {
      this.selectCalJornada(list[list.length - 1].numero_jornada);
    }
  }

  nextCalJornada(): void {
    const list = this.calJornadas();
    if (list.length <= 1) return;
    const curNum = this.calSelectedJornadaNum();
    const curIdx = list.findIndex(j => j.numero_jornada === curNum);
    if (curIdx < list.length - 1) {
      this.selectCalJornada(list[curIdx + 1].numero_jornada);
    } else {
      this.selectCalJornada(list[0].numero_jornada);
    }
  }

  toggleCalPublicada(): void {
    this.calJornadaPublicada.update(v => !v);
  }

  autoAssignSequentialTimes(): void {
    const list = [...this.calMatches()];
    list.forEach((m: any, idx) => {
      const slot = this.standardTimeSlots[idx % this.standardTimeSlots.length];
      m.horario = slot;
      m.hora = slot;
    });
    this.calMatches.set(list);
    this.calHasChanges.set(true);
    this.checkCalendarConflicts();
  }

  hasTimeConflict(time?: string): boolean {
    if (!time) return false;
    return this.calConflictTimes().includes(time);
  }

  checkCalendarConflicts(): void {
    const matches = this.calMatches();
    const hourCounts: Record<string, number> = {};
    matches.forEach((m: any) => {
      const hora = m.horario || m.hora;
      if (hora && m.estado !== 'suspendido') {
        hourCounts[hora] = (hourCounts[hora] || 0) + 1;
      }
    });

    const conflicts: string[] = [];
    let count = 0;
    for (const h in hourCounts) {
      if (hourCounts[h] > 1) {
        conflicts.push(h);
        count += (hourCounts[h] - 1);
      }
    }
    this.calConflictTimes.set(conflicts);
    this.calConflictsCount.set(count);
  }

  setMatchTime(matchId: number, slot: string): void {
    const list = [...this.calMatches()];
    const match: any = list.find(m => m.id === matchId);
    if (match) {
      match.horario = slot;
      match.hora = slot;
      this.calMatches.set(list);
      this.calHasChanges.set(true);
      this.checkCalendarConflicts();
    }
  }

  invertirLocalia(matchId: number): void {
    const list = [...this.calMatches()];
    const match = list.find(m => m.id === matchId);
    if (match) {
      const tempId = match.equipo_local_id;
      const tempEq = match.equipo_local;
      match.equipo_local_id = match.equipo_visitante_id;
      match.equipo_local = match.equipo_visitante;
      match.equipo_visitante_id = tempId;
      match.equipo_visitante = tempEq;
      this.calMatches.set(list);
      this.calHasChanges.set(true);
    }
  }

  togglePostponedMatch(matchId: number): void {
    const list = [...this.calMatches()];
    const match = list.find(m => m.id === matchId);
    if (match) {
      match.estado = match.estado === 'suspendido' ? 'programado' : 'suspendido';
      this.calMatches.set(list);
      this.calHasChanges.set(true);
      this.checkCalendarConflicts();
    }
  }

  guardarCalendarioJornada(): void {
    this.calIsSaving.set(true);
    setTimeout(() => {
      this.calIsSaving.set(false);
      this.calHasChanges.set(false);
      this.calSuccessToast.set(`¡Calendario oficial de la Jornada ${this.calSelectedJornadaNum()} guardado con éxito!`);
      this.calendarioGuardado.emit();
      setTimeout(() => {
        this.calSuccessToast.set(null);
      }, 4000);
    }, 600);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.cerrar.emit();
    }
  }
}
