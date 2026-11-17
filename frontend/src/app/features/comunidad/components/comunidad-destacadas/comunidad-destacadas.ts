import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { TorneoService } from '../../../../core/services';
import { LideresTorneo } from '../../../../core/models';

export interface JugadoraDestacada {
  premio: string;
  badgeIcon: string;
  jugadora: string;
  dorsal: number | null;
  equipo: string;
  escudoEquipo: string | null;
  fotoUrl: string | null; // null = Ghost Player (no autorizó su imagen) o sin foto
  metricaPrincipal: string;
  detalle: string;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

@Component({
  selector: 'app-comunidad-destacadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comunidad-destacadas.html',
  styleUrls: ['./comunidad-destacadas.scss']
})
export class ComunidadDestacadasComponent implements OnInit {
  private torneoService = inject(TorneoService);

  // null mientras carga; [] si todavía no hay partidos finalizados con goles
  jugadorasDestacadas = signal<JugadoraDestacada[] | null>(null);

  ngOnInit(): void {
    this.torneoService.getLideres().pipe(take(1)).subscribe({
      next: lideres => this.jugadorasDestacadas.set(this.armarTarjetas(lideres)),
      error: () => this.jugadorasDestacadas.set([])
    });
  }

  private armarTarjetas({ goleadoras, porteras, figura_jornada }: LideresTorneo): JugadoraDestacada[] {
    const tarjetas: JugadoraDestacada[] = [];

    const lider = goleadoras[0];
    if (lider) {
      const empatadas = goleadoras.filter(g => g.goles === lider.goles).length - 1;
      const promedio = lider.partidos_equipo > 0 ? (lider.goles / lider.partidos_equipo).toFixed(1) : '0';
      tarjetas.push({
        premio: 'Líder Goleadora',
        badgeIcon: '⚽',
        jugadora: lider.nombre_deportivo,
        dorsal: lider.dorsal,
        equipo: lider.equipo,
        escudoEquipo: lider.escudo_url,
        fotoUrl: lider.foto_url,
        metricaPrincipal: plural(lider.goles, 'gol anotado', 'goles anotados'),
        detalle: `Promedio de ${promedio} goles por partido en ${plural(lider.partidos_equipo, 'partido jugado', 'partidos jugados')}.`
          + (empatadas > 0 ? ` Comparte el liderato con ${plural(empatadas, 'jugadora más', 'jugadoras más')}.` : '')
      });
    }

    const portera = porteras[0];
    if (portera) {
      tarjetas.push({
        premio: 'Mejor Portera',
        badgeIcon: '🧤',
        jugadora: portera.nombre_deportivo,
        dorsal: portera.dorsal,
        equipo: portera.equipo,
        escudoEquipo: portera.escudo_url,
        fotoUrl: portera.foto_url,
        metricaPrincipal: plural(portera.goles_recibidos, 'gol recibido', 'goles recibidos'),
        detalle: `${plural(portera.vallas_invictas, 'portería imbatida', 'porterías imbatidas')} en ${plural(portera.partidos_jugados, 'partido', 'partidos')}.`
      });
    }

    const figura = figura_jornada;
    if (figura) {
      const resultado = figura.gano ? 'en la victoria' : 'en el partido';
      tarjetas.push({
        premio: `Figura de la Jornada ${figura.numero_jornada}`,
        badgeIcon: '★',
        jugadora: figura.nombre_deportivo,
        dorsal: figura.dorsal,
        equipo: figura.equipo,
        escudoEquipo: figura.escudo_url,
        fotoUrl: figura.foto_url,
        metricaPrincipal: figura.goles >= 3 ? `Hat-trick: ${figura.goles} goles` : plural(figura.goles, 'gol', 'goles'),
        detalle: `Anotó ${plural(figura.goles, 'gol', 'goles')} ${resultado} ${figura.marcador} contra ${figura.rival}.`
      });
    }

    return tarjetas;
  }
}
