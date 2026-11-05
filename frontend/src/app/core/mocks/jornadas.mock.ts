import { Jornada } from '../models';
import { MOCK_EQUIPOS } from './equipos.mock';

export const MOCK_JORNADAS: Jornada[] = [
  // Jornada 4 - Recientemente Finalizada
  {
    id: 4,
    torneo_id: 1,
    numero_jornada: 4,
    fecha_domingo: '2026-10-25',
    partidos: [
      {
        id: 19,
        jornada_id: 4,
        equipo_local_id: 1,
        equipo_visitante_id: 6,
        horario: '09:00',
        goles_local: 3,
        goles_visitante: 1,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: 1,
        estado: 'finalizado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: 'Partido dinámico sin incidentes.',
        equipo_local: MOCK_EQUIPOS[0], // Amazonas CDMX
        equipo_visitante: MOCK_EQUIPOS[5], // Panteras de Oriente
        ganador: MOCK_EQUIPOS[0],
        incidencias: [
          { id: 1, partido_id: 19, jugadora_id: 1, equipo_id: 1, tipo: 'gol', minuto: 8, nombre_jugadora: 'Valeria "La Rusa"', nombre_equipo: 'Amazonas CDMX', dorsal: 10 },
          { id: 2, partido_id: 19, jugadora_id: 3, equipo_id: 1, tipo: 'gol', minuto: 14, nombre_jugadora: 'Camila Ríos', nombre_equipo: 'Amazonas CDMX', dorsal: 7 },
          { id: 3, partido_id: 19, jugadora_id: 4, equipo_id: 1, tipo: 'tarjeta_amarilla', minuto: 19, nombre_jugadora: 'Lucía "Muro" Morales', nombre_equipo: 'Amazonas CDMX', dorsal: 4 }
        ]
      },
      {
        id: 20,
        jornada_id: 4,
        equipo_local_id: 2,
        equipo_visitante_id: 7,
        horario: '10:00',
        goles_local: 2,
        goles_visitante: 2,
        empate_minuto_18: true, // Empate persistió al min 18 -> Tanda de penales
        penales_local: 4,
        penales_visitante: 3,
        ganador_id: 2, // Valquirias gana en penales (3 pts)
        estado: 'finalizado',
        cancha: 'Cancha 2',
        notas_mesa: 'Definido en muerte súbita de penales tras empate 2-2 al min 18.',
        equipo_local: MOCK_EQUIPOS[1], // Valquirias FC
        equipo_visitante: MOCK_EQUIPOS[6], // Dinamo Arcoíris
        ganador: MOCK_EQUIPOS[1],
        incidencias: [
          { id: 4, partido_id: 20, jugadora_id: 5, equipo_id: 2, tipo: 'gol', minuto: 11, nombre_jugadora: 'Dani Torres', nombre_equipo: 'Valquirias FC', dorsal: 9 }
        ]
      },
      {
        id: 21,
        jornada_id: 4,
        equipo_local_id: 4,
        equipo_visitante_id: 5,
        horario: '11:00',
        goles_local: 2,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: 4,
        estado: 'finalizado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[3], // Furia Violeta
        equipo_visitante: MOCK_EQUIPOS[4], // Rebeldes del Balón
        ganador: MOCK_EQUIPOS[3]
      },
      {
        id: 22,
        jornada_id: 4,
        equipo_local_id: 3,
        equipo_visitante_id: 10,
        horario: '12:00',
        goles_local: 3,
        goles_visitante: 1,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: 3,
        estado: 'finalizado',
        cancha: 'Cancha 2',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[2], // Centellas Diversas
        equipo_visitante: MOCK_EQUIPOS[9], // Espartanas Coyoacán
        ganador: MOCK_EQUIPOS[2]
      },
      {
        id: 23,
        jornada_id: 4,
        equipo_local_id: 8,
        equipo_visitante_id: 11,
        horario: '13:00',
        goles_local: 1,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: 8,
        estado: 'finalizado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[7], // Sirenas del Sur
        equipo_visitante: MOCK_EQUIPOS[10], // Ángeles del Ajusco
        ganador: MOCK_EQUIPOS[7]
      },
      {
        id: 24,
        jornada_id: 4,
        equipo_local_id: 12,
        equipo_visitante_id: 9,
        horario: '14:00',
        goles_local: 2,
        goles_visitante: 1,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: 12,
        estado: 'finalizado',
        cancha: 'Cancha 2',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[11], // Brava Sporting
        equipo_visitante: MOCK_EQUIPOS[8], // Halconas de Chapultepec
        ganador: MOCK_EQUIPOS[11]
      }
    ]
  },

  // Jornada 5 - Próximo Domingo (Cartelera en Vivo)
  {
    id: 5,
    torneo_id: 1,
    numero_jornada: 5,
    fecha_domingo: '2026-11-08',
    partidos: [
      {
        id: 25,
        jornada_id: 5,
        equipo_local_id: 1,
        equipo_visitante_id: 2,
        horario: '09:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: 'Duelo por la cima de la tabla (1° vs 2°).',
        equipo_local: MOCK_EQUIPOS[0], // Amazonas CDMX
        equipo_visitante: MOCK_EQUIPOS[1] // Valquirias FC
      },
      {
        id: 26,
        jornada_id: 5,
        equipo_local_id: 3,
        equipo_visitante_id: 4,
        horario: '10:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[2], // Centellas Diversas
        equipo_visitante: MOCK_EQUIPOS[3] // Furia Violeta
      },
      {
        id: 27,
        jornada_id: 5,
        equipo_local_id: 5,
        equipo_visitante_id: 8,
        horario: '11:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 2',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[4], // Rebeldes del Balón
        equipo_visitante: MOCK_EQUIPOS[7] // Sirenas del Sur
      },
      {
        id: 28,
        jornada_id: 5,
        equipo_local_id: 6,
        equipo_visitante_id: 7,
        horario: '12:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[5], // Panteras de Oriente
        equipo_visitante: MOCK_EQUIPOS[6] // Dinamo Arcoíris
      },
      {
        id: 29,
        jornada_id: 5,
        equipo_local_id: 9,
        equipo_visitante_id: 11,
        horario: '13:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 2',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[8], // Halconas de Chapultepec
        equipo_visitante: MOCK_EQUIPOS[10] // Ángeles del Ajusco
      },
      {
        id: 30,
        jornada_id: 5,
        equipo_local_id: 10,
        equipo_visitante_id: 12,
        horario: '14:00',
        goles_local: 0,
        goles_visitante: 0,
        empate_minuto_18: false,
        penales_local: null,
        penales_visitante: null,
        ganador_id: null,
        estado: 'programado',
        cancha: 'Cancha 1 (Principal)',
        notas_mesa: null,
        equipo_local: MOCK_EQUIPOS[9], // Espartanas Coyoacán
        equipo_visitante: MOCK_EQUIPOS[11] // Brava Sporting
      }
    ]
  }
];
