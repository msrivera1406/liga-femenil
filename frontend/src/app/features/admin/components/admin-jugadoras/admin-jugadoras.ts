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
import { JugadorasService, EquiposService } from '../../../../core/services';
import { JugadoraPublica, PosicionJugadora, Equipo } from '../../../../core/models';

@Component({
  selector: 'app-admin-jugadoras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-jugadoras.html',
  styleUrls: ['./admin-jugadoras.scss']
})
export class AdminJugadorasComponent implements OnInit {
  private jugadorasService = inject(JugadorasService);
  private equiposService = inject(EquiposService);

  @Output() cerrar = new EventEmitter<void>();

  jugadorasList = signal<JugadoraPublica[]>([]);
  equiposList = signal<Equipo[]>([]);
  jugadorasTab = signal<'planteles' | 'bolsa'>('planteles');
  jugadorasSearchQuery = signal<string>('');
  jugadorasClubFilter = signal<number | 'todos'>('todos');
  jugadorasPosFilter = signal<string>('todos');
  jugadorasLoading = signal<boolean>(false);
  jugadoraSuccessToast = signal<string | null>(null);

  showJugadoraFormModal = signal<boolean>(false);
  isEditingJugadora = signal<boolean>(false);
  editingJugadoraId: number | null = null;
  jugadoraIsSaving = signal<boolean>(false);

  formJNombreDeportivo: string = '';
  formJPronombres: string = 'Ella';
  formJPosicion: PosicionJugadora = 'Medio';
  formJEquipoId: number | null = null;
  formJDorsal: number | null = null;
  formJFotoUrl: string = '';
  formJAutorizaImagen: boolean = true;
  formJNombreLegal: string = '';
  formJEdad: number | null = null;
  formJTelefonoContacto: string = '';
  formJTipoSangre: string = 'O+';
  formJContactoEmergenciaNombre: string = '';
  formJContactoEmergenciaTelefono: string = '';
  formJContactoEmergenciaParentesco: string = 'Madre';
  formJAlergiasCondiciones: string = '';
  formJNivelExperiencia: string = 'Intermedio (Juego recreativo y regular)';

  showAssignJugadoraModal = signal<boolean>(false);
  assignTargetJugadora = signal<JugadoraPublica | null>(null);
  assignTargetEquipoId: number | null = null;
  assignTargetDorsal: number | null = 10;
  assignIsSaving = signal<boolean>(false);

  showDetailJugadoraModal = signal<boolean>(false);
  detailTargetJugadora = signal<JugadoraPublica | null>(null);

  showDeleteJugadoraModal = signal<boolean>(false);
  jugadoraToDelete = signal<JugadoraPublica | null>(null);

  jugadorasPlanteles = computed(() => {
    return this.jugadorasList().filter(j => !j.es_independiente);
  });

  jugadorasBolsa = computed(() => {
    return this.jugadorasList().filter(j => j.es_independiente);
  });

  filteredJugadorasPlanteles = computed(() => {
    let list = this.jugadorasPlanteles();
    const club = this.jugadorasClubFilter();
    const pos = this.jugadorasPosFilter();
    const query = this.jugadorasSearchQuery().trim().toLowerCase();

    if (club !== 'todos') {
      list = list.filter(j => j.equipo_id === club);
    }
    if (pos !== 'todos') {
      list = list.filter(j => j.posicion === pos);
    }
    if (query) {
      list = list.filter(j =>
        j.nombre_deportivo.toLowerCase().includes(query) ||
        (j.dorsal !== null && j.dorsal.toString().includes(query)) ||
        (j.nombre_legal && j.nombre_legal.toLowerCase().includes(query)) ||
        (j.nombre_equipo && j.nombre_equipo.toLowerCase().includes(query))
      );
    }
    return list;
  });

  filteredJugadorasBolsa = computed(() => {
    let list = this.jugadorasBolsa();
    const pos = this.jugadorasPosFilter();
    const query = this.jugadorasSearchQuery().trim().toLowerCase();

    if (pos !== 'todos') {
      list = list.filter(j => j.posicion === pos);
    }
    if (query) {
      list = list.filter(j =>
        j.nombre_deportivo.toLowerCase().includes(query) ||
        (j.nombre_legal && j.nombre_legal.toLowerCase().includes(query)) ||
        (j.telefono_contacto && j.telefono_contacto.includes(query)) ||
        (j.folio_registro && j.folio_registro.toLowerCase().includes(query))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.cargarJugadoras();
    this.cargarEquipos();
  }

  cargarJugadoras(): void {
    this.jugadorasLoading.set(true);
    this.jugadorasService.getJugadoras().pipe(take(1)).subscribe({
      next: (data) => {
        this.jugadorasList.set(data.map(j => ({ ...j })));
        this.jugadorasLoading.set(false);
      },
      error: () => {
        this.jugadorasLoading.set(false);
      }
    });
  }

  cargarEquipos(): void {
    this.equiposService.getEquipos().pipe(take(1)).subscribe(data => {
      this.equiposList.set(data.map(e => ({ ...e })));
    });
  }

  getEquipoNombre(equipoId: number | null): string {
    if (!equipoId) return 'Bolsa Independiente';
    const eq = this.equiposList().find(e => e.id === equipoId);
    return eq ? eq.nombre : 'Club Oficial';
  }

  getEquipoEscudo(equipoId: number | null): string | null {
    if (!equipoId) return null;
    const eq = this.equiposList().find(e => e.id === equipoId);
    return eq?.escudo_url || null;
  }

  openCreateJugadoraModal(defaultEquipoId?: number | 'todos' | null): void {
    const eqId = defaultEquipoId && defaultEquipoId !== 'todos' ? defaultEquipoId : (this.equiposList().length > 0 ? this.equiposList()[0].id : null);
    this.isEditingJugadora.set(false);
    this.editingJugadoraId = null;
    this.formJNombreDeportivo = '';
    this.formJPronombres = 'Ella';
    this.formJPosicion = 'Medio';
    this.formJEquipoId = eqId;
    this.formJDorsal = 10;
    this.formJFotoUrl = '';
    this.formJAutorizaImagen = true;
    this.formJNombreLegal = '';
    this.formJEdad = 22;
    this.formJTelefonoContacto = '';
    this.formJTipoSangre = 'O+';
    this.formJContactoEmergenciaNombre = '';
    this.formJContactoEmergenciaTelefono = '';
    this.formJContactoEmergenciaParentesco = 'Madre';
    this.formJAlergiasCondiciones = '';
    this.formJNivelExperiencia = 'Intermedio (Juego recreativo y regular)';
    this.showJugadoraFormModal.set(true);
  }

  openEditJugadoraModal(j: JugadoraPublica): void {
    this.isEditingJugadora.set(true);
    this.editingJugadoraId = j.id;
    this.formJNombreDeportivo = j.nombre_deportivo;
    this.formJPronombres = j.pronombres || 'Ella';
    this.formJPosicion = j.posicion;
    this.formJEquipoId = j.equipo_id;
    this.formJDorsal = j.dorsal;
    this.formJFotoUrl = j.foto_url || '';
    this.formJAutorizaImagen = j.autoriza_imagen;
    this.formJNombreLegal = j.nombre_legal || '';
    this.formJEdad = j.edad ?? null;
    this.formJTelefonoContacto = j.telefono_contacto || '';
    this.formJTipoSangre = j.tipo_sangre || 'O+';
    this.formJContactoEmergenciaNombre = j.contacto_emergencia_nombre || '';
    this.formJContactoEmergenciaTelefono = j.contacto_emergencia_telefono || '';
    this.formJContactoEmergenciaParentesco = j.contacto_emergencia_parentesco || 'Madre';
    this.formJAlergiasCondiciones = j.alergias_condiciones || '';
    this.formJNivelExperiencia = j.nivel_experiencia || 'Intermedio (Juego recreativo y regular)';
    this.showJugadoraFormModal.set(true);
  }

  closeJugadoraFormModal(): void {
    this.showJugadoraFormModal.set(false);
  }

  guardarJugadoraForm(): void {
    if (!this.formJNombreDeportivo.trim()) return;

    this.jugadoraIsSaving.set(true);
    const eqNombre = this.formJEquipoId ? this.getEquipoNombre(this.formJEquipoId) : 'Bolsa Independiente';

    const payload: Partial<JugadoraPublica> = {
      nombre_deportivo: this.formJNombreDeportivo.trim(),
      pronombres: this.formJPronombres,
      posicion: this.formJPosicion,
      equipo_id: this.formJEquipoId,
      dorsal: this.formJEquipoId ? (this.formJDorsal || 1) : null,
      foto_url: this.formJFotoUrl.trim() || null,
      autoriza_imagen: this.formJAutorizaImagen,
      nombre_equipo: eqNombre,
      es_independiente: !this.formJEquipoId,
      nombre_legal: this.formJNombreLegal.trim(),
      edad: this.formJEdad,
      telefono_contacto: this.formJTelefonoContacto.trim(),
      tipo_sangre: this.formJTipoSangre,
      contacto_emergencia_nombre: this.formJContactoEmergenciaNombre.trim(),
      contacto_emergencia_telefono: this.formJContactoEmergenciaTelefono.trim(),
      contacto_emergencia_parentesco: this.formJContactoEmergenciaParentesco,
      alergias_condiciones: this.formJAlergiasCondiciones.trim(),
      nivel_experiencia: this.formJNivelExperiencia
    };

    if (this.isEditingJugadora() && this.editingJugadoraId !== null) {
      const id = this.editingJugadoraId;
      this.jugadorasService.actualizarJugadora(id, payload).pipe(take(1)).subscribe({
        next: () => {
          this.jugadoraIsSaving.set(false);
          this.closeJugadoraFormModal();
          this.jugadorasList.update(list => list.map(j => j.id === id ? { ...j, ...payload } : j));
          this.showJugadoraToast(`Cédula de ${payload.nombre_deportivo} actualizada con éxito.`);
        },
        error: () => {
          this.jugadoraIsSaving.set(false);
        }
      });
    } else {
      this.jugadorasService.crearJugadora(payload).pipe(take(1)).subscribe({
        next: (res) => {
          this.jugadoraIsSaving.set(false);
          this.closeJugadoraFormModal();
          if (res.data) {
            this.jugadorasList.update(list => [...list, res.data]);
          }
          this.showJugadoraToast(`¡Cédula de ${payload.nombre_deportivo} registrada con éxito!`);
        },
        error: () => {
          this.jugadoraIsSaving.set(false);
        }
      });
    }
  }

  openAssignModal(j: JugadoraPublica): void {
    this.assignTargetJugadora.set(j);
    this.assignTargetEquipoId = j.equipo_id || (this.equiposList().length > 0 ? this.equiposList()[0].id : 1);
    this.assignTargetDorsal = j.dorsal || 10;
    this.showAssignJugadoraModal.set(true);
  }

  closeAssignModal(): void {
    this.showAssignJugadoraModal.set(false);
    this.assignTargetJugadora.set(null);
  }

  guardarAsignacionClub(): void {
    const jugadora = this.assignTargetJugadora();
    const equipoId = this.assignTargetEquipoId;
    const dorsal = this.assignTargetDorsal || 10;

    if (!jugadora || !equipoId) return;

    this.assignIsSaving.set(true);
    const nombreEquipo = this.getEquipoNombre(equipoId);

    this.jugadorasService.asignarEquipo(jugadora.id, equipoId, dorsal, nombreEquipo).pipe(take(1)).subscribe({
      next: () => {
        this.assignIsSaving.set(false);
        this.closeAssignModal();
        this.jugadorasList.update(list => list.map(j => j.id === jugadora.id ? {
          ...j,
          equipo_id: equipoId,
          dorsal: dorsal,
          nombre_equipo: nombreEquipo,
          es_independiente: false
        } : j));
        this.showJugadoraToast(`¡${jugadora.nombre_deportivo} asignada a ${nombreEquipo} con dorsal #${dorsal}!`);
      },
      error: () => {
        this.assignIsSaving.set(false);
      }
    });
  }

  desvincularJugadora(j: JugadoraPublica): void {
    if (confirm(`¿Transferir a "${j.nombre_deportivo}" a la Bolsa Independiente?`)) {
      this.jugadorasService.desvincularEquipo(j.id).pipe(take(1)).subscribe({
        next: () => {
          this.jugadorasList.update(list => list.map(item => item.id === j.id ? {
            ...item,
            equipo_id: null,
            dorsal: null,
            nombre_equipo: 'Bolsa Independiente',
            es_independiente: true
          } : item));
          this.showJugadoraToast(`"${j.nombre_deportivo}" ha sido transferida a la Bolsa Independiente.`);
        }
      });
    }
  }

  openDetailModal(j: JugadoraPublica): void {
    this.detailTargetJugadora.set(j);
    this.showDetailJugadoraModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailJugadoraModal.set(false);
    this.detailTargetJugadora.set(null);
  }

  openDeleteJugadoraConfirm(j: JugadoraPublica): void {
    this.jugadoraToDelete.set(j);
    this.showDeleteJugadoraModal.set(true);
  }

  closeDeleteJugadoraModal(): void {
    this.showDeleteJugadoraModal.set(false);
    this.jugadoraToDelete.set(null);
  }

  confirmDeleteJugadora(): void {
    const jugadora = this.jugadoraToDelete();
    if (!jugadora) return;

    this.jugadorasService.eliminarJugadora(jugadora.id).pipe(take(1)).subscribe({
      next: () => {
        this.jugadorasList.update(list => list.filter(j => j.id !== jugadora.id));
        this.closeDeleteJugadoraModal();
        this.showJugadoraToast(`Se ha eliminado la cédula de ${jugadora.nombre_deportivo}.`);
      }
    });
  }

  showJugadoraToast(msg: string): void {
    this.jugadoraSuccessToast.set(msg);
    setTimeout(() => {
      this.jugadoraSuccessToast.set(null);
    }, 4000);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.showJugadoraFormModal()) {
        this.closeJugadoraFormModal();
      } else if (this.showAssignJugadoraModal()) {
        this.closeAssignModal();
      } else if (this.showDetailJugadoraModal()) {
        this.closeDetailModal();
      } else if (this.showDeleteJugadoraModal()) {
        this.closeDeleteJugadoraModal();
      } else {
        this.cerrar.emit();
      }
    }
  }
}
