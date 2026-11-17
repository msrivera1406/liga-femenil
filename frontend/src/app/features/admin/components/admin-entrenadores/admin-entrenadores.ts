import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { EntrenadoresService } from '../../../../core/services';
import { Entrenador, DisponibilidadEntrenador } from '../../../../core/models';

interface DiaAgendaForm {
  key: string;
  label: string;
  activo: boolean;
  horasStr: string;
}

@Component({
  selector: 'app-admin-entrenadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-entrenadores.html',
  styleUrls: ['./admin-entrenadores.scss']
})
export class AdminEntrenadoresComponent implements OnInit {
  private entrenadoresService = inject(EntrenadoresService);

  // Lista de entrenadores
  entrenadoresList = signal<Entrenador[]>([]);
  isLoading = signal<boolean>(true);

  // Filtros de búsqueda
  searchQuery = signal<string>('');
  disciplinaFilter = signal<string>('todas');
  statusFilter = signal<string>('todos'); // 'todos' | 'activos' | 'pausados'

  // Notificación Toast flotante
  toastMessage = signal<string | null>(null);
  private toastTimeout: any = null;

  // Estados de modales
  showFormModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingId: number | null = null;
  isSaving = signal<boolean>(false);

  showDetailModal = signal<boolean>(false);
  detailTarget = signal<Entrenador | null>(null);

  showDeleteModal = signal<boolean>(false);
  targetToDelete = signal<Entrenador | null>(null);

  // Campos de formulario reactivo
  formNombreCompleto: string = '';
  formDisciplinas: string = '';
  formZonasCobertura: string = '';
  formBio: string = '';
  formPrecioSesion: number = 450;
  formTelefonoPublico: string = '';
  formFotoUrl: string = '';
  formActivo: boolean = true;

  // Matriz de disponibilidad semanal para el formulario
  formAgendaDias: DiaAgendaForm[] = [
    { key: 'lunes', label: 'Lunes', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
    { key: 'martes', label: 'Martes', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
    { key: 'miercoles', label: 'Miércoles', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
    { key: 'jueves', label: 'Jueves', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
    { key: 'viernes', label: 'Viernes', activo: true, horasStr: '07:00 - 08:30, 16:00 - 17:30' },
    { key: 'sabado', label: 'Sábado', activo: true, horasStr: '08:00 - 11:00' },
    { key: 'domingo', label: 'Domingo', activo: false, horasStr: '' }
  ];

  // Métricas computadas
  totalCount = computed(() => this.entrenadoresList().length);
  activeCount = computed(() => this.entrenadoresList().filter(e => e.activo).length);
  pausedCount = computed(() => this.entrenadoresList().filter(e => !e.activo).length);

  // Lista filtrada para la cuadrícula
  filteredEntrenadores = computed(() => {
    let list = this.entrenadoresList();
    const query = this.searchQuery().trim().toLowerCase();
    const disc = this.disciplinaFilter();
    const status = this.statusFilter();

    if (query) {
      list = list.filter(e => 
        e.nombre_completo.toLowerCase().includes(query) ||
        e.disciplinas.toLowerCase().includes(query) ||
        e.zonas_cobertura.toLowerCase().includes(query) ||
        e.bio.toLowerCase().includes(query)
      );
    }

    if (disc !== 'todas') {
      list = list.filter(e => e.disciplinas.toLowerCase().includes(disc.toLowerCase()));
    }

    if (status === 'activos') {
      list = list.filter(e => e.activo);
    } else if (status === 'pausados') {
      list = list.filter(e => !e.activo);
    }

    return list;
  });

  // Lista única de disciplinas para los chips de filtro
  disciplinasUnicas = computed(() => {
    const set = new Set<string>();
    this.entrenadoresList().forEach(e => {
      this.getDisciplinasList(e.disciplinas).forEach(d => set.add(d));
    });
    return Array.from(set).slice(0, 7);
  });

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  loadEntrenadores(): void {
    this.isLoading.set(true);
    this.entrenadoresService.getEntrenadoresAdmin().pipe(take(1)).subscribe({
      next: (list) => {
        this.entrenadoresList.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Apertura de modal para crear
  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId = null;
    this.formNombreCompleto = '';
    this.formDisciplinas = 'Acondicionamiento Funcional, Fuerza';
    this.formZonasCobertura = 'Roma-Condesa, Cuauhtémoc, Juárez';
    this.formBio = '';
    this.formPrecioSesion = 450;
    this.formTelefonoPublico = '+52 55 ';
    this.formFotoUrl = '';
    this.formActivo = true;

    this.formAgendaDias = [
      { key: 'lunes', label: 'Lunes', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
      { key: 'martes', label: 'Martes', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
      { key: 'miercoles', label: 'Miércoles', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
      { key: 'jueves', label: 'Jueves', activo: true, horasStr: '07:00 - 08:30, 18:00 - 19:30' },
      { key: 'viernes', label: 'Viernes', activo: true, horasStr: '07:00 - 08:30, 16:00 - 17:30' },
      { key: 'sabado', label: 'Sábado', activo: true, horasStr: '08:00 - 11:00' },
      { key: 'domingo', label: 'Domingo', activo: false, horasStr: '' }
    ];

    this.showFormModal.set(true);
  }

  // Apertura de modal para editar
  openEditModal(entrenador: Entrenador): void {
    this.isEditing.set(true);
    this.editingId = entrenador.id;
    this.formNombreCompleto = entrenador.nombre_completo;
    this.formDisciplinas = entrenador.disciplinas;
    this.formZonasCobertura = entrenador.zonas_cobertura;
    this.formBio = entrenador.bio;
    this.formPrecioSesion = entrenador.precio_sesion;
    this.formTelefonoPublico = entrenador.telefono_publico;
    this.formFotoUrl = entrenador.foto_url || '';
    this.formActivo = entrenador.activo;

    // Mapear agenda desde disponibilidad_json
    const disp = entrenador.disponibilidad_json || {};
    this.formAgendaDias = [
      { key: 'lunes', label: 'Lunes', activo: !!disp.lunes?.activo, horasStr: disp.lunes?.horas?.join(', ') || '' },
      { key: 'martes', label: 'Martes', activo: !!disp.martes?.activo, horasStr: disp.martes?.horas?.join(', ') || '' },
      { key: 'miercoles', label: 'Miércoles', activo: !!disp.miercoles?.activo, horasStr: disp.miercoles?.horas?.join(', ') || '' },
      { key: 'jueves', label: 'Jueves', activo: !!disp.jueves?.activo, horasStr: disp.jueves?.horas?.join(', ') || '' },
      { key: 'viernes', label: 'Viernes', activo: !!disp.viernes?.activo, horasStr: disp.viernes?.horas?.join(', ') || '' },
      { key: 'sabado', label: 'Sábado', activo: !!disp.sabado?.activo, horasStr: disp.sabado?.horas?.join(', ') || '' },
      { key: 'domingo', label: 'Domingo', activo: !!disp.domingo?.activo, horasStr: disp.domingo?.horas?.join(', ') || '' }
    ];

    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  // Aplicar horarios predefinidos rápidos a un día
  setPresetHorario(dia: DiaAgendaForm, preset: 'manana' | 'tarde' | 'ambos'): void {
    dia.activo = true;
    if (preset === 'manana') {
      dia.horasStr = '07:00 - 08:30, 08:30 - 10:00';
    } else if (preset === 'tarde') {
      dia.horasStr = '18:00 - 19:30, 19:30 - 21:00';
    } else if (preset === 'ambos') {
      dia.horasStr = '07:00 - 08:30, 18:00 - 19:30';
    }
  }

  // Guardar creación o edición
  saveForm(): void {
    if (!this.formNombreCompleto.trim()) return;

    this.isSaving.set(true);

    // Construir disponibilidad_json
    const dispJson: DisponibilidadEntrenador = {};
    for (const d of this.formAgendaDias) {
      if (d.activo && d.horasStr.trim()) {
        const horasArr = d.horasStr.split(',').map(h => h.trim()).filter(Boolean);
        dispJson[d.key] = { activo: true, horas: horasArr };
      } else {
        dispJson[d.key] = { activo: false, horas: [] };
      }
    }

    const payload: Partial<Entrenador> = {
      nombre_completo: this.formNombreCompleto.trim(),
      disciplinas: this.formDisciplinas.trim(),
      zonas_cobertura: this.formZonasCobertura.trim(),
      bio: this.formBio.trim(),
      precio_sesion: Number(this.formPrecioSesion) || 450,
      telefono_publico: this.formTelefonoPublico.trim(),
      foto_url: this.formFotoUrl.trim() || null,
      activo: this.formActivo,
      disponibilidad_json: dispJson
    };

    if (this.isEditing() && this.editingId !== null) {
      const id = this.editingId;
      this.entrenadoresService.actualizarEntrenador(id, payload).pipe(take(1)).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeFormModal();
          this.entrenadoresList.update(list => list.map(e => e.id === id ? { ...e, ...payload } : e));
          this.showToast(`Perfil de ${payload.nombre_completo} actualizado con éxito.`);
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          alert(err?.message || 'No se pudo guardar.');
        }
      });
    } else {
      this.entrenadoresService.crearEntrenador(payload).pipe(take(1)).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.closeFormModal();
          this.entrenadoresList.update(list => [res.data, ...list]);
          this.showToast(`¡${res.data.nombre_completo} dada de alta en el catálogo!`);
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          alert(err?.message || 'No se pudo guardar.');
        }
      });
    }
  }

  // Toggle rápido Activo / Pausado
  toggleActivo(entrenador: Entrenador, event: Event): void {
    event.stopPropagation();
    const nuevoEstado = !entrenador.activo;
    this.entrenadoresService.toggleActivo(entrenador.id, nuevoEstado).pipe(take(1)).subscribe({
      next: () => {
        this.entrenadoresList.update(list => 
          list.map(e => e.id === entrenador.id ? { ...e, activo: nuevoEstado } : e)
        );
        this.showToast(nuevoEstado 
          ? `${entrenador.nombre_completo} está visible en la web.` 
          : `${entrenador.nombre_completo} fue pausada temporalmente.`
        );
      },
      error: (err: Error) => alert(err?.message || 'No se pudo completar la acción.')
    });
  }

  // Modal de Detalle Completo (Ficha y Agenda)
  openDetailModal(entrenador: Entrenador): void {
    this.detailTarget.set(entrenador);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.detailTarget.set(null);
  }

  // Modal de Confirmación de Baja
  openDeleteConfirm(entrenador: Entrenador): void {
    this.targetToDelete.set(entrenador);
    this.showDeleteModal.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteModal.set(false);
    this.targetToDelete.set(null);
  }

  confirmDelete(): void {
    const target = this.targetToDelete();
    if (!target) return;

    this.entrenadoresService.eliminarEntrenador(target.id).pipe(take(1)).subscribe({
      next: () => {
        this.entrenadoresList.update(list => list.filter(e => e.id !== target.id));
        this.closeDeleteConfirm();
        this.showToast(`${target.nombre_completo} eliminada del catálogo.`);
      },
      error: (err: Error) => alert(err?.message || 'No se pudo completar la acción.')
    });
  }

  // Utilidades de renderizado idénticas a Home Page
  getDisciplinasList(disciplinasStr: string): string[] {
    if (!disciplinasStr) return [];
    return disciplinasStr.split(',').map(d => d.trim()).filter(Boolean);
  }

  getDisponibilidadResumen(entrenador: Entrenador): string {
    if (!entrenador.disponibilidad_json) return 'Horarios a convenir';
    const diasActivos = Object.entries(entrenador.disponibilidad_json)
      .filter(([_, info]) => info && info.activo && info.horas && info.horas.length > 0)
      .map(([dia]) => dia.charAt(0).toUpperCase() + dia.slice(1));

    if (diasActivos.length === 0) return 'Sin horarios activos';
    if (diasActivos.length === 7) return 'Lun a Dom (Toda la semana)';
    if (diasActivos.length >= 5 && !diasActivos.includes('Sabado') && !diasActivos.includes('Domingo')) {
      return 'Lunes a Viernes';
    }
    return diasActivos.join(', ');
  }

  getWhatsAppLink(entrenador: Entrenador): string {
    return this.entrenadoresService.generarEnlaceWhatsApp(entrenador);
  }

  getDiasAgendaDetalle(entrenador: Entrenador): { dia: string; activo: boolean; horas: string[] }[] {
    const orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const nombres = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    const disp = entrenador.disponibilidad_json || {};
    return orden.map(k => ({
      dia: nombres[k as keyof typeof nombres],
      activo: !!disp[k]?.activo && (disp[k]?.horas?.length || 0) > 0,
      horas: disp[k]?.horas || []
    }));
  }

  showToast(msg: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set(msg);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3800);
  }
}
