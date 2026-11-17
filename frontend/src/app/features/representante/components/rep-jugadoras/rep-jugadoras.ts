import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { JugadorasService, BackendApiService } from '../../../../core/services';
import { JugadoraPublica, PosicionJugadora } from '../../../../core/models';

@Component({
  selector: 'app-rep-jugadoras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rep-jugadoras.html',
  styleUrls: ['./rep-jugadoras.scss']
})
export class RepJugadorasComponent implements OnInit {
  private jugadorasService = inject(JugadorasService);
  private backendApi = inject(BackendApiService);

  @Input() equipoId!: number;
  @Input() equipoNombre: string = 'Tu Club';
  @Input() equipoEscudoUrl: string | null = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() totalJugadorasChange = new EventEmitter<number>();
  @Output() irAClub = new EventEmitter<void>();

  // Lista y estado del plantel
  jugadorasList = signal<JugadoraPublica[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  selectedPosicionFilter = signal<string>('todos');
  successToast = signal<string | null>(null);

  // Modales interactivos
  showFormModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingJugadoraId: number | null = null;
  isSaving = signal<boolean>(false);

  showDetailModal = signal<boolean>(false);
  detailJugadora = signal<JugadoraPublica | null>(null);

  showDeleteModal = signal<boolean>(false);
  jugadoraToDelete = signal<JugadoraPublica | null>(null);

  // Campos del formulario
  formNombreDeportivo: string = '';
  formDorsal: number | null = null;
  formPosicion: PosicionJugadora = 'Medio';
  formFotoUrl: string = '';
  formNombreLegal: string = '';
  formEdad: number | null = null;
  formTelefonoContacto: string = '';
  formTipoSangre: string = 'O+';
  formContactoEmergenciaNombre: string = '';
  formContactoEmergenciaTelefono: string = '';
  formContactoEmergenciaParentesco: string = 'Madre';
  formAlergiasCondiciones: string = '';
  formAutorizaImagen: boolean = true;

  // Catálogos
  readonly posicionesCatalog: PosicionJugadora[] = ['Portera', 'Defensa', 'Medio', 'Delantera'];
  readonly tiposSangre = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // Jugadoras filtradas por búsqueda y posición
  filteredJugadoras = computed(() => {
    let list = this.jugadorasList();
    const pos = this.selectedPosicionFilter();
    const q = this.searchQuery().trim().toLowerCase();

    if (pos !== 'todos') {
      list = list.filter(j => j.posicion === pos);
    }

    if (q) {
      list = list.filter(j =>
        j.nombre_deportivo.toLowerCase().includes(q) ||
        (j.dorsal !== null && j.dorsal.toString().includes(q)) ||
        (j.nombre_legal && j.nombre_legal.toLowerCase().includes(q))
      );
    }

    return list;
  });

  // Conteo por posiciones
  statsConteo = computed(() => {
    const list = this.jugadorasList();
    return {
      total: list.length,
      por: list.filter(j => j.posicion === 'Portera').length,
      def: list.filter(j => j.posicion === 'Defensa').length,
      med: list.filter(j => j.posicion === 'Medio').length,
      del: list.filter(j => j.posicion === 'Delantera').length
    };
  });

  ngOnInit(): void {
    this.cargarPlantel();
  }

  cargarPlantel(): void {
    this.isLoading.set(true);
    const targetId = this.equipoId || 1;

    this.jugadorasService.getPlantelPrivado(targetId).pipe(take(1)).subscribe({
      next: (data) => {
        const list = data || [];
        this.jugadorasList.set(list.map(j => ({ ...j })));
        this.totalJugadorasChange.emit(list.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Apertura del modal para crear jugadora
  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingJugadoraId = null;
    this.formNombreDeportivo = '';
    this.formDorsal = this.sugerirSiguienteDorsal();
    this.formPosicion = 'Medio';
    this.formFotoUrl = '';
    this.formNombreLegal = '';
    this.formEdad = 22;
    this.formTelefonoContacto = '';
    this.formTipoSangre = 'O+';
    this.formContactoEmergenciaNombre = '';
    this.formContactoEmergenciaTelefono = '';
    this.formContactoEmergenciaParentesco = 'Familiar';
    this.formAlergiasCondiciones = 'Ninguna';
    this.formAutorizaImagen = true;
    this.showFormModal.set(true);
  }

  // Apertura del modal para editar jugadora
  openEditModal(jugadora: JugadoraPublica): void {
    this.isEditing.set(true);
    this.editingJugadoraId = jugadora.id;
    this.formNombreDeportivo = jugadora.nombre_deportivo;
    this.formDorsal = jugadora.dorsal;
    this.formPosicion = jugadora.posicion;
    this.formFotoUrl = jugadora.foto_url || '';
    this.formNombreLegal = jugadora.nombre_legal || '';
    this.formEdad = jugadora.edad || null;
    this.formTelefonoContacto = jugadora.telefono_contacto || '';
    this.formTipoSangre = jugadora.tipo_sangre || 'O+';
    this.formContactoEmergenciaNombre = jugadora.contacto_emergencia_nombre || '';
    this.formContactoEmergenciaTelefono = jugadora.contacto_emergencia_telefono || '';
    this.formContactoEmergenciaParentesco = jugadora.contacto_emergencia_parentesco || 'Familiar';
    this.formAlergiasCondiciones = jugadora.alergias_condiciones || '';
    this.formAutorizaImagen = jugadora.autoriza_imagen ?? true;
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingJugadoraId = null;
  }

  // Carga de foto con FileReader
  onFotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert('La foto supera el límite de 3 MB.');
        return;
      }
      // Se sube al servidor y se guarda su URL (la base de datos no almacena la imagen)
      this.backendApi.subirImagen(file, 'jugadora').pipe(take(1)).subscribe({
        next: url => this.formFotoUrl = url,
        error: (err: Error) => alert(err.message)
      });
    }
  }

  // Guardar jugadora (Crear o Actualizar)
  guardarJugadora(): void {
    if (!this.formNombreDeportivo.trim()) return;

    this.isSaving.set(true);
    const targetTeamId = this.equipoId || 1;

    const payload: Partial<JugadoraPublica> = {
      equipo_id: targetTeamId,
      nombre_deportivo: this.formNombreDeportivo.trim(),
      dorsal: this.formDorsal !== null ? Number(this.formDorsal) : null,
      posicion: this.formPosicion,
      foto_url: this.formFotoUrl.trim() || null,
      nombre_legal: this.formNombreLegal.trim() || this.formNombreDeportivo.trim(),
      edad: this.formEdad ? Number(this.formEdad) : null,
      telefono_contacto: this.formTelefonoContacto.trim() || '',
      tipo_sangre: this.formTipoSangre,
      contacto_emergencia_nombre: this.formContactoEmergenciaNombre.trim() || '',
      contacto_emergencia_telefono: this.formContactoEmergenciaTelefono.trim() || '',
      contacto_emergencia_parentesco: this.formContactoEmergenciaParentesco || '',
      alergias_condiciones: this.formAlergiasCondiciones.trim() || 'Ninguna',
      autoriza_imagen: this.formAutorizaImagen,
      es_independiente: false,
      activo: true,
      nombre_equipo: this.equipoNombre
    };

    if (this.isEditing() && this.editingJugadoraId !== null) {
      const id = this.editingJugadoraId;
      this.jugadorasService.actualizarJugadora(id, payload).pipe(take(1)).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.jugadorasList.update(list => list.map(j => j.id === id ? { ...j, ...payload, id } : j));
          this.closeFormModal();
          this.mostrarToast(`Datos de ${payload.nombre_deportivo} actualizados.`);
        },
        error: (err: Error) => { this.isSaving.set(false); alert(err?.message || 'No se pudo guardar.'); }
      });
    } else {
      this.jugadorasService.crearJugadora(payload).pipe(take(1)).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          if (res.data) {
            this.jugadorasList.update(list => [...list, res.data]);
            this.totalJugadorasChange.emit(this.jugadorasList().length);
          }
          this.closeFormModal();
          this.mostrarToast(`¡${payload.nombre_deportivo} inscrita con el dorsal #${payload.dorsal}!`);
        },
        error: (err: Error) => { this.isSaving.set(false); alert(err?.message || 'No se pudo guardar.'); }
      });
    }
  }

  // Ficha deportiva detallada
  openDetailModal(jugadora: JugadoraPublica): void {
    this.detailJugadora.set(jugadora);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.detailJugadora.set(null);
  }

  // Baja de jugadora con confirmación
  openDeleteModal(jugadora: JugadoraPublica): void {
    this.jugadoraToDelete.set(jugadora);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.jugadoraToDelete.set(null);
  }

  confirmarBaja(): void {
    const jug = this.jugadoraToDelete();
    if (!jug) return;

    this.jugadorasService.eliminarJugadora(jug.id).pipe(take(1)).subscribe({
      next: () => {
        this.jugadorasList.update(list => list.filter(j => j.id !== jug.id));
        this.totalJugadorasChange.emit(this.jugadorasList().length);
        this.closeDeleteModal();
        this.mostrarToast(`${jug.nombre_deportivo} ha sido retirada del plantel.`);
      },
      error: (err: Error) => alert(err?.message || 'No se pudo completar la acción.')
    });
  }

  private sugerirSiguienteDorsal(): number {
    const dorsales = this.jugadorasList().map(j => j.dorsal).filter((d): d is number => d !== null);
    for (let i = 1; i <= 99; i++) {
      if (!dorsales.includes(i)) return i;
    }
    return 10;
  }

  mostrarToast(msg: string): void {
    this.successToast.set(msg);
    setTimeout(() => {
      this.successToast.set(null);
    }, 3500);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  onIrAClub(): void {
    this.irAClub.emit();
  }
}
