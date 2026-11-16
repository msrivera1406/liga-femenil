import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface JugadoraDestacada {
  premio: string;
  subtitulo?: string;
  badgeIcon: string;
  jugadora: string;
  dorsal: number;
  equipo: string;
  escudoEquipo: string;
  fotoUrl: string;
  metricaPrincipal: string;
  detalle: string;
}

@Component({
  selector: 'app-comunidad-destacadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comunidad-destacadas.html',
  styleUrls: ['./comunidad-destacadas.scss']
})
export class ComunidadDestacadasComponent {
  // Jugadoras destacadas (adaptado al boceto de tarjetas con foto circular discreta)
  jugadorasDestacadas: JugadoraDestacada[] = [
    {
      premio: 'Líder Goleadora',
      subtitulo: 'Bota de Oro',
      badgeIcon: '⚽',
      jugadora: 'Regina Morales León',
      dorsal: 9,
      equipo: 'TBD UNITED',
      escudoEquipo: '/images/Escudos/TBD_united.jpeg',
      fotoUrl: '/images/jugadoras/tbd-united/jugadora_10.jpg',
      metricaPrincipal: '8 Goles anotados',
      detalle: 'Promedio de 2.0 goles por encuentro en 4 jornadas disputadas.'
    },
    {
      premio: 'Mejor Portera',
      subtitulo: 'Guante de Oro',
      badgeIcon: '🧤',
      jugadora: 'Laura Martínez Silva',
      dorsal: 1,
      equipo: 'VALQUIRIAS',
      escudoEquipo: '/images/Escudos/Valquirias.jpeg',
      fotoUrl: '/images/jugadoras/valquirias/jugadora_01.jpg',
      metricaPrincipal: '2 Goles recibidos',
      detalle: '2 porterías imbatidas y 87% de efectividad en atajadas.'
    },
    {
      premio: 'MVP de la Semana',
      subtitulo: 'Figura Dominical',
      badgeIcon: '★',
      jugadora: 'Regina Torres Méndez',
      dorsal: 15,
      equipo: 'QUEER GOALS',
      escudoEquipo: '/images/Escudos/Queer_goals.jpeg',
      fotoUrl: '/images/jugadoras/queer-goals/jugadora_15.jpg',
      metricaPrincipal: 'Hat-Trick & Asistencia',
      detalle: 'Anotó 3 goles decisivos y dio el pase definitorio al min 18.'
    }
  ];
}
