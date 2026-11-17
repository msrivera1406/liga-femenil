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
import { EquiposService, JugadorasService } from '../../../../core/services';
import { Equipo, JugadoraPublica } from '../../../../core/models';

@Component({
  selector: 'app-admin-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-equipos.html',
  styleUrls: ['./admin-equipos.scss']
})
export class AdminEquiposComponent implements OnInit {
  private equiposService = inject(EquiposService);
  private jugadorasService = inject(JugadorasService);

  @Output() cerrar = new EventEmitter<void>();
  @Output() irAJugadoras = new EventEmitter<void>();

  equiposList = signal<Equipo[]>([]);
  equiposSearchQuery = signal<string>('');
  teamSuccessToast = signal<string | null>(null);

  filteredEquipos = computed(() => {
    const list = this.equiposList();
    const query = this.equiposSearchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(e => e.nombre.toLowerCase().includes(query));
  });

  showTeamFormModal = signal<boolean>(false);
  isEditingTeam = signal<boolean>(false);
  editingTeamId: number | null = null;
  teamFormNombre: string = '';
  teamFormEscudoUrl: string = '';
  teamFormVideoUrl: string = '';
  teamIsSaving = signal<boolean>(false);

  showDeleteTeamModal = signal<boolean>(false);
  teamToDelete = signal<Equipo | null>(null);

  showRosterPreviewModal = signal<boolean>(false);
  rosterPreviewTeam = signal<Equipo | null>(null);
  rosterPreviewPlayers = signal<JugadoraPublica[]>([]);
  rosterPreviewLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarEquipos();
  }

  cargarEquipos(): void {
    this.equiposService.getEquipos().pipe(take(1)).subscribe(data => {
      this.equiposList.set(data.map(e => ({ ...e })));
    });
  }

  openCreateTeamModal(): void {
    this.isEditingTeam.set(false);
    this.editingTeamId = null;
    this.teamFormNombre = '';
    this.teamFormEscudoUrl = '';
    this.teamFormVideoUrl = '';
    this.showTeamFormModal.set(true);
  }

  openEditTeamModal(equipo: Equipo): void {
    this.isEditingTeam.set(true);
    this.editingTeamId = equipo.id;
    this.teamFormNombre = equipo.nombre;
    this.teamFormEscudoUrl = equipo.escudo_url || '';
    this.teamFormVideoUrl = equipo.video_url || '';
    this.showTeamFormModal.set(true);
  }

  closeTeamFormModal(): void {
    this.showTeamFormModal.set(false);
    this.editingTeamId = null;
    this.teamFormNombre = '';
    this.teamFormEscudoUrl = '';
    this.teamFormVideoUrl = '';
  }

  guardarEquipoForm(): void {
    if (!this.teamFormNombre.trim()) return;

    this.teamIsSaving.set(true);
    const payload: Partial<Equipo> = {
      nombre: this.teamFormNombre.trim(),
      escudo_url: this.teamFormEscudoUrl.trim() || null,
      video_url: this.teamFormVideoUrl.trim() || null
    };

    if (this.isEditingTeam() && this.editingTeamId !== null) {
      const id = this.editingTeamId;
      this.equiposService.actualizarEquipo(id, payload).pipe(take(1)).subscribe({
        next: (res) => {
          this.teamIsSaving.set(false);
          this.closeTeamFormModal();
          this.equiposList.update(list => list.map(e => e.id === id ? { ...e, ...payload } : e));
          this.showTeamToast(`Datos de ${payload.nombre} actualizados con éxito.`);
        },
        error: (err: Error) => {
          this.teamIsSaving.set(false);
          alert(err?.message || 'No se pudo guardar.');
        }
      });
    } else {
      this.equiposService.crearEquipo(payload).pipe(take(1)).subscribe({
        next: (res) => {
          this.teamIsSaving.set(false);
          this.closeTeamFormModal();
          if (res.data) {
            this.equiposList.update(list => [...list, res.data]);
          }
          this.showTeamToast(`¡Club ${payload.nombre} registrado exitosamente!`);
        },
        error: (err: Error) => {
          this.teamIsSaving.set(false);
          alert(err?.message || 'No se pudo guardar.');
        }
      });
    }
  }

  openDeleteTeamConfirm(equipo: Equipo): void {
    this.teamToDelete.set(equipo);
    this.showDeleteTeamModal.set(true);
  }

  closeDeleteTeamModal(): void {
    this.showDeleteTeamModal.set(false);
    this.teamToDelete.set(null);
  }

  confirmDeleteTeam(): void {
    const team = this.teamToDelete();
    if (!team) return;

    this.equiposService.eliminarEquipo(team.id).pipe(take(1)).subscribe({
      next: () => {
        this.equiposList.update(list => list.filter(e => e.id !== team.id));
        this.closeDeleteTeamModal();
        this.showTeamToast(`El club ${team.nombre} ha sido retirado.`);
      },
      error: (err: Error) => alert(err?.message || 'No se pudo completar la acción.')
    });
  }

  showTeamToast(msg: string): void {
    this.teamSuccessToast.set(msg);
    setTimeout(() => {
      this.teamSuccessToast.set(null);
    }, 4000);
  }

  openRosterPreview(equipo: Equipo): void {
    this.rosterPreviewTeam.set(equipo);
    this.rosterPreviewPlayers.set([]);
    this.rosterPreviewLoading.set(true);
    this.showRosterPreviewModal.set(true);

    this.jugadorasService.getJugadorasByEquipo(equipo.id).pipe(take(1)).subscribe({
      next: (jugadoras) => {
        this.rosterPreviewPlayers.set(jugadoras);
        this.rosterPreviewLoading.set(false);
      },
      error: () => {
        this.rosterPreviewPlayers.set([]);
        this.rosterPreviewLoading.set(false);
      }
    });
  }

  closeRosterPreviewModal(): void {
    this.showRosterPreviewModal.set(false);
    this.rosterPreviewTeam.set(null);
    this.rosterPreviewPlayers.set([]);
  }

  goToJugadorasPanel(): void {
    this.closeRosterPreviewModal();
    this.irAJugadoras.emit();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.showTeamFormModal()) {
        this.closeTeamFormModal();
      } else if (this.showDeleteTeamModal()) {
        this.closeDeleteTeamModal();
      } else if (this.showRosterPreviewModal()) {
        this.closeRosterPreviewModal();
      } else {
        this.cerrar.emit();
      }
    }
  }
}
