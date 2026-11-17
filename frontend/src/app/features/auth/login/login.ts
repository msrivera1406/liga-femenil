import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../core/services';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Modelos del formulario
  identificador: string = '';
  contrasena: string = '';

  // Estados reactivos
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    if (this.route.snapshot.queryParamMap.get('motivo') === 'sesion') {
      this.errorMessage.set('Tu sesión expiró. Inicia sesión para continuar.');
    }
  }

  // Regresa a la pantalla pedida solo si pertenece al panel del rol; si no, va al panel por defecto
  private destinoTrasLogin(user: Usuario): string {
    const panel = user.rol === 'superadmin' ? '/admin' : '/representante';
    const volver = this.route.snapshot.queryParamMap.get('volver') || '';
    const esDelPanel = volver === panel || volver.startsWith(panel + '/') || volver.startsWith(panel + '?');
    return esDelPanel ? volver : panel;
  }

  // Enlace directo a WhatsApp de la Directora con número configurable y mensaje pre-llenado
  private directoraWhatsApp = '525598765432';
  private prefilledMessage = encodeURIComponent(
    'Hola Directora, solicito apoyo para restablecer la contraseña de mi cuenta de acceso a la plataforma oficial.'
  );

  get whatsappUrl(): string {
    return `https://wa.me/${this.directoraWhatsApp}?text=${this.prefilledMessage}`;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmitLogin(): void {
    if (!this.identificador || !this.contrasena) {
      this.errorMessage.set('Por favor ingresa tu correo y contraseña.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login(this.identificador, this.contrasena)
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.isLoading.set(false);
          this.router.navigateByUrl(this.destinoTrasLogin(user));
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.message || 'Error al iniciar sesión. Inténtalo nuevamente.');
        }
      });
  }
}
