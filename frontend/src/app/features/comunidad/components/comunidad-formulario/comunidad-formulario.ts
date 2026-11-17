import {
  Component,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { JugadorasService } from '../../../../core/services';
import { NivelExperiencia, PosicionJugadora, TipoSangre } from '../../../../core/models';

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
  registroForm = this.formularioVacio();
  isSubmitting = signal<boolean>(false);
  registroExitoso = signal<{ folio: string; nombre: string } | null>(null);

  private formularioVacio() {
    return {
      nombre_deportivo: '',
      posicion: 'Medio' as PosicionJugadora,
      nivel_experiencia: 'Intermedio' as NivelExperiencia,
      nombre_legal: '',
      edad: null as number | null,
      telefono_contacto: '',
      tipo_sangre: 'O+' as TipoSangre,
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      contacto_emergencia_parentesco: 'Madre',
      alergias_condiciones: '',
      autoriza_imagen: true,
      aviso_privacidad_aceptado: false
    };
  }

  // Devuelve el primer problema encontrado, o null si el formulario es válido.
  // Las reglas coinciden con las de backend/registrar.php.
  private validar(): string | null {
    const f = this.registroForm;
    const requeridos = [
      f.nombre_deportivo, f.nombre_legal, f.telefono_contacto,
      f.contacto_emergencia_nombre, f.contacto_emergencia_telefono, f.contacto_emergencia_parentesco
    ];
    if (requeridos.some(v => !v || !v.trim()) || f.edad === null) {
      return 'Por favor completa todos los campos requeridos marcados con asterisco (*).';
    }
    if (!Number.isInteger(f.edad) || f.edad < 16 || f.edad > 65) {
      return 'La edad debe estar entre 16 y 65 años.';
    }
    const telefonoValido = (t: string) => /^[0-9+\s()-]{8,20}$/.test(t.trim());
    if (!telefonoValido(f.telefono_contacto) || !telefonoValido(f.contacto_emergencia_telefono)) {
      return 'Revisa los teléfonos: deben tener entre 8 y 20 dígitos.';
    }
    if (!f.aviso_privacidad_aceptado) {
      return 'Debes aceptar el aviso de privacidad y reglamento de espacio seguro para continuar.';
    }
    return null;
  }

  // Envío del formulario
  onSubmitRegistro(): void {
    const error = this.validar();
    if (error) {
      alert(error);
      return;
    }
    const f = this.registroForm;
    this.isSubmitting.set(true);
    this.jugadorasService.registrarIndependiente({
      nombre_deportivo: f.nombre_deportivo.trim(),
      posicion: f.posicion,
      nivel_experiencia: f.nivel_experiencia,
      nombre_legal: f.nombre_legal.trim(),
      edad: f.edad as number,
      telefono_contacto: f.telefono_contacto.trim(),
      tipo_sangre: f.tipo_sangre,
      contacto_emergencia_nombre: f.contacto_emergencia_nombre.trim(),
      contacto_emergencia_telefono: f.contacto_emergencia_telefono.trim(),
      contacto_emergencia_parentesco: f.contacto_emergencia_parentesco,
      alergias_condiciones: f.alergias_condiciones.trim(),
      autoriza_imagen: f.autoriza_imagen,
      aviso_privacidad_aceptado: f.aviso_privacidad_aceptado
    }).pipe(take(1)).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.registroExitoso.set({
          folio: res.data.folio_registro,
          nombre: f.nombre_deportivo
        });
      },
      // Si falla, no se muestra éxito: la jugadora debe saber que su registro no se guardó
      error: (err: Error) => {
        this.isSubmitting.set(false);
        alert(err?.message || 'No se pudo completar el registro. Inténtalo de nuevo.');
      }
    });
  }

  resetRegistro(): void {
    this.registroExitoso.set(null);
    this.registroForm = this.formularioVacio();
  }
}
