import {
  Component,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntrenadoresService } from '../../../../core/services';
import { Entrenador } from '../../../../core/models';

@Component({
  selector: 'app-trainers-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainers-carousel.html',
  styleUrls: ['./trainers-carousel.scss']
})
export class TrainersCarouselComponent {
  private entrenadoresService = inject(EntrenadoresService);

  entrenadores$ = this.entrenadoresService.getEntrenadores();

  @ViewChild('trainersTrack') trainersTrack?: ElementRef<HTMLElement>;

  scrollTrainers(direction: 'left' | 'right'): void {
    if (!this.trainersTrack?.nativeElement) return;
    const container = this.trainersTrack.nativeElement;
    const scrollAmount = Math.max(320, container.clientWidth * 0.75);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  getWhatsAppLink(entrenador: Entrenador): string {
    return this.entrenadoresService.generarEnlaceWhatsApp(entrenador);
  }

  getDisciplinasList(disciplinas: string): string[] {
    if (!disciplinas) return [];
    return disciplinas.split(',').map(d => d.trim()).filter(Boolean);
  }

  getDisponibilidadResumen(entrenador: Entrenador): string {
    if (!entrenador.disponibilidad_json) return 'Horarios a convenir';
    const diasActivos = Object.entries(entrenador.disponibilidad_json)
      .filter(([_, val]) => val?.activo)
      .map(([dia]) => dia.charAt(0).toUpperCase() + dia.slice(1, 3));
    if (diasActivos.length >= 5) return 'Lun a Sáb disponible';
    if (diasActivos.length > 0) return `${diasActivos.join(', ')}`;
    return 'Bajo previa cita';
  }
}
