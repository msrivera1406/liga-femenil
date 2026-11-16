import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../core/services';

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

  // Modelos del formulario
  identificador: string = '';
  contrasena: string = '';

  // Estados reactivos
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

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
      this.errorMessage.set('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login(this.identificador, this.contrasena)
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.isLoading.set(false);
          // Redirección condicional según rol
          if (user.rol === 'superadmin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/representante']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.message || 'Error al iniciar sesión. Inténtalo nuevamente.');
        }
      });
  }
}
