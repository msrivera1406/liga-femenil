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
import { EquiposService, BackendApiService } from '../../../../core/services';
import { Equipo, PosicionTabla } from '../../../../core/models';

export interface ColorPreset {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-rep-club',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rep-club.html',
  styleUrls: ['./rep-club.scss']
})
export class RepClubComponent implements OnInit {
  private equiposService = inject(EquiposService);
  private backendApi = inject(BackendApiService);

  @Input() equipoId: number | null = null;
  @Input() initialEquipo: Equipo | null = null;
  @Input() posicionTabla: PosicionTabla | null = null;
  @Input() totalJugadoras: number = 0;

  @Output() cerrar = new EventEmitter<void>();
  @Output() clubActualizado = new EventEmitter<Equipo>();
  @Output() irAJugadoras = new EventEmitter<void>();

  // Estado del formulario
  nombre: string = '';
  escudoUrl: string = '';
  videoUrl: string = '';
  colorPrimario: string = '#165644';
  colorSecundario: string = '#F7D08A';
  representanteNombre: string = '';
  contactoTelefono: string = '';
  instagramHandle: string = '';

  // Estados de interfaz reactivos
  isSaving = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  activeTab = signal<'identidad' | 'multimedia' | 'contacto'>('identidad');

  // Paleta de colores preestablecidos para equipaciones
  readonly colorPresets: ColorPreset[] = [
    { name: 'Esmeralda', hex: '#165644' },
    { name: 'Dorado', hex: '#C5A059' },
    { name: 'Coral', hex: '#D96552' },
    { name: 'Violeta', hex: '#7C3AED' },
    { name: 'Azul Real', hex: '#1E3A8A' },
    { name: 'Cielo', hex: '#0284C7' },
    { name: 'Rosa Vivo', hex: '#DB2777' },
    { name: 'Negro Azabache', hex: '#18181B' }
  ];

  // Escudos predefinidos de la liga para selección rápida
  readonly presetEscudos = [
    { label: 'Queer Goals', url: '/images/Escudos/Queer_goals.jpeg' },
    { label: 'Valquirias', url: '/images/Escudos/Valquirias.jpeg' },
    { label: 'Good Vibes', url: '/images/Escudos/Good_vibes.jpeg' },
    { label: 'Bandidas', url: '/images/Escudos/bandidas.jpeg' },
    { label: 'Lobas', url: '/images/Escudos/lobas.jpeg' }
  ];

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    if (this.initialEquipo) {
      this.poblarFormulario(this.initialEquipo);
    } else if (this.equipoId) {
      this.equiposService.getEquipoById(this.equipoId).pipe(take(1)).subscribe(eq => {
        if (eq) {
          this.poblarFormulario(eq);
        }
      });
    }
  }

  private poblarFormulario(eq: Equipo): void {
    this.nombre = eq.nombre || '';
    this.escudoUrl = eq.escudo_url || '';
    this.videoUrl = eq.video_url || '';
    this.representanteNombre = 'Capitana / Representante Oficial';
    this.contactoTelefono = '55 1234 5678';
    this.instagramHandle = '@' + this.nombre.toLowerCase().replace(/\s+/g, '_');
  }

  // Selección de color predefinido
  selectColorPrimario(hex: string): void {
    this.colorPrimario = hex;
  }

  selectColorSecundario(hex: string): void {
    this.colorSecundario = hex;
  }

  // Selección rápida de escudo
  selectPresetEscudo(url: string): void {
    this.escudoUrl = url;
  }

  // Carga de archivo de imagen local para el escudo (FileReader)
  onEscudoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validación de tamaño (máx 3MB)
      if (file.size > 3 * 1024 * 1024) {
        this.errorMessage.set('La imagen seleccionada supera el límite recomendado de 3MB.');
        setTimeout(() => this.errorMessage.set(null), 4000);
        return;
      }

      // Se sube al servidor y se guarda su URL (la base de datos no almacena la imagen)
      this.backendApi.subirImagen(file, 'escudo').pipe(take(1)).subscribe({
        next: url => this.escudoUrl = url,
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          setTimeout(() => this.errorMessage.set(null), 4000);
        }
      });
    }
  }

  // Guardar cambios oficiales del club
  guardarCambios(): void {
    const nombreTrim = this.nombre.trim();
    if (!nombreTrim) {
      this.errorMessage.set('El nombre del club no puede estar vacío.');
      setTimeout(() => this.errorMessage.set(null), 3500);
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const payload: Partial<Equipo> = {
      nombre: nombreTrim,
      escudo_url: this.escudoUrl.trim() || null,
      video_url: this.videoUrl.trim() || null
    };

    const targetId = this.equipoId || this.initialEquipo?.id;
    if (!targetId) { this.isSaving.set(false); return; }

    this.equiposService.actualizarEquipo(targetId, payload).pipe(take(1)).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        const equipoActualizado: Equipo = {
          id: targetId,
          capitana_id: this.initialEquipo?.capitana_id ?? null,
          nombre: nombreTrim,
          escudo_url: this.escudoUrl.trim() || null,
          video_url: this.videoUrl.trim() || null,
          total_jugadoras: this.totalJugadoras
        };
        this.clubActualizado.emit(equipoActualizado);
        this.successMessage.set(`¡Ficha de "${nombreTrim}" actualizada con éxito!`);
        setTimeout(() => {
          this.successMessage.set(null);
        }, 3500);
      },
      error: (err: Error) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.message || 'Hubo un error al guardar los cambios. Intenta nuevamente.');
        setTimeout(() => this.errorMessage.set(null), 4000);
      }
    });
  }

  onIrAJugadoras(): void {
    this.irAJugadoras.emit();
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
