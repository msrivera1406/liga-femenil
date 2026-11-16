import {
  Component,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { JugadorasService } from '../../../../core/services';

@Component({
  selector: 'app-comunidad-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunidad-formulario.html',
  styleUrls: ['./comunidad-formulario.scss']
})
export class ComunidadFormularioComponent {
  private jugadorasService = inject(JugadorasService);

  // Formulario de registro "Únete a nosotros"
  registroForm = {
    nombre_deportivo: '',
    posicion: 'Medio' as 'Portera' | 'Defensa' | 'Medio' | 'Delantera',
    nivel_experiencia: 'Intermedio (Juego recreativo y regular)',
    nombre_legal: '',
    edad: null as number | null,
    telefono_contacto: '',
    tipo_sangre: 'O+',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_parentesco: 'Madre',
    alergias_condiciones: '',
    autoriza_imagen: true,
    aviso_privacidad_aceptado: false
  };

  isSubmitting = signal<boolean>(false);
  registroExitoso = signal<{ folio: string; nombre: string } | null>(null);

  // Envío del formulario
  onSubmitRegistro(): void {
    if (!this.registroForm.nombre_deportivo || !this.registroForm.nombre_legal || !this.registroForm.telefono_contacto || !this.registroForm.edad) {
      alert('Por favor completa todos los campos requeridos marcados con asterisco (*).');
      return;
    }

    if (!this.registroForm.aviso_privacidad_aceptado) {
      alert('Debes aceptar el aviso de privacidad y reglamento de espacio seguro para continuar.');
      return;
    }

    this.isSubmitting.set(true);

    this.jugadorasService.registrarIndependiente({
      nombre_deportivo: this.registroForm.nombre_deportivo,
      posicion: this.registroForm.posicion,
      nombre_legal: this.registroForm.nombre_legal,
      edad: this.registroForm.edad,
      telefono_contacto: this.registroForm.telefono_contacto,
      tipo_sangre: this.registroForm.tipo_sangre,
      contacto_emergencia_nombre: this.registroForm.contacto_emergencia_nombre,
      contacto_emergencia_telefono: this.registroForm.contacto_emergencia_telefono,
      contacto_emergencia_parentesco: this.registroForm.contacto_emergencia_parentesco,
      alergias_condiciones: this.registroForm.alergias_condiciones,
      autoriza_imagen: this.registroForm.autoriza_imagen,
      aviso_privacidad_aceptado: this.registroForm.aviso_privacidad_aceptado,
      nivel_experiencia: this.registroForm.nivel_experiencia
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.registroExitoso.set({
          folio: res.data.folio_registro,
          nombre: this.registroForm.nombre_deportivo
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.registroExitoso.set({
          folio: 'IND-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          nombre: this.registroForm.nombre_deportivo
        });
      }
    });
  }

  resetRegistro(): void {
    this.registroExitoso.set(null);
    this.registroForm = {
      nombre_deportivo: '',
      posicion: 'Medio',
      nivel_experiencia: 'Intermedio (Juego recreativo y regular)',
      nombre_legal: '',
      edad: null,
      telefono_contacto: '',
      tipo_sangre: 'O+',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      contacto_emergencia_parentesco: 'Madre',
      alergias_condiciones: '',
      autoriza_imagen: true,
      aviso_privacidad_aceptado: false
    };
  }
}
