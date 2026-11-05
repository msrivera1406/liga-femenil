import { Entrenador } from '../models';

export const MOCK_ENTRENADORES: Entrenador[] = [
  {
    id: 1,
    nombre_completo: 'Mariana "Ronda" Estrada',
    disciplinas: 'Boxeo Defensivo, Acondicionamiento Funcional, Kickboxing',
    zonas_cobertura: 'Cuauhtémoc, Juárez, Roma-Condesa, San Rafael',
    bio: 'Ex-pugilista profesional y entrenadora certificada en autodefensa feminista. Especialista en resistencia cardiovascular, técnica de golpeo y empoderamiento a través del deporte.',
    precio_sesion: 450,
    telefono_publico: '+52 55 1234 5678',
    activo: true,
    foto_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&auto=format&fit=crop&q=80',
    disponibilidad_json: {
      lunes: { activo: true, horas: ['07:00 - 08:30', '18:00 - 19:30', '19:30 - 21:00'] },
      martes: { activo: true, horas: ['07:00 - 08:30', '18:00 - 19:30'] },
      miercoles: { activo: true, horas: ['07:00 - 08:30', '18:00 - 19:30', '19:30 - 21:00'] },
      jueves: { activo: true, horas: ['07:00 - 08:30', '18:00 - 19:30'] },
      viernes: { activo: true, horas: ['07:00 - 08:30', '16:00 - 17:30'] },
      sabado: { activo: true, horas: ['08:00 - 10:00', '10:30 - 12:30'] },
      domingo: { activo: false, horas: [] }
    }
  },
  {
    id: 2,
    nombre_completo: 'Renato "Koke" Domínguez',
    disciplinas: 'Karate-Do, Movilidad Articular, Prevención de Lesiones en Fútbol',
    zonas_cobertura: 'Coyoacán, Benito Juárez, Del Valle, Narvarte',
    bio: 'Cinta negra 3er Dan en Karate-Do y fisioterapeuta deportivo. Enfocado en estabilidad neuromuscular para futbolistas, fortalecimiento de rodilla y tobillo, y disciplina marcial.',
    precio_sesion: 500,
    telefono_publico: '+52 55 2345 6789',
    activo: true,
    foto_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&auto=format&fit=crop&q=80',
    disponibilidad_json: {
      lunes: { activo: true, horas: ['06:30 - 08:00', '19:00 - 20:30'] },
      martes: { activo: true, horas: ['06:30 - 08:00', '17:00 - 18:30', '19:00 - 20:30'] },
      miercoles: { activo: true, horas: ['06:30 - 08:00', '19:00 - 20:30'] },
      jueves: { activo: true, horas: ['06:30 - 08:00', '17:00 - 18:30', '19:00 - 20:30'] },
      viernes: { activo: true, horas: ['06:30 - 08:00', '15:00 - 16:30'] },
      sabado: { activo: true, horas: ['09:00 - 11:00'] },
      domingo: { activo: false, horas: [] }
    }
  },
  {
    id: 3,
    nombre_completo: 'Ariadna "Ari" Silva',
    disciplinas: 'Fuerza & Potencia, HIIT, Preparación Física de Alto Rendimiento',
    zonas_cobertura: 'Miguel Hidalgo, Polanco, Anzures, Escandón',
    bio: 'Preparadora física de atletas de alto rendimiento en fútbol femenil. Especializada en pliometría, aceleración, cambios de ritmo y fortalecimiento de core.',
    precio_sesion: 480,
    telefono_publico: '+52 55 3456 7890',
    activo: true,
    foto_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&auto=format&fit=crop&q=80',
    disponibilidad_json: {
      lunes: { activo: true, horas: ['07:00 - 09:00', '17:00 - 19:00'] },
      martes: { activo: true, horas: ['07:00 - 09:00', '17:00 - 19:00'] },
      miercoles: { activo: true, horas: ['07:00 - 09:00', '17:00 - 19:00'] },
      jueves: { activo: true, horas: ['07:00 - 09:00', '17:00 - 19:00'] },
      viernes: { activo: true, horas: ['07:00 - 09:00', '16:00 - 18:00'] },
      sabado: { activo: true, horas: ['08:00 - 11:00'] },
      domingo: { activo: false, horas: [] }
    }
  },
  {
    id: 4,
    nombre_completo: 'Alex Morales (Elle)',
    disciplinas: 'Calistenia, Flexibilidad, Yoga Deportivo y Meditación de Competencia',
    zonas_cobertura: 'Tlalpan, Xochimilco, Coyoacán Sur',
    bio: 'Instructor/e certificado/a en acondicionamiento funcional y calistenia. Enfoque holístico que une resistencia física, respiración consciente y mentalidad deportiva en espacios seguros.',
    precio_sesion: 420,
    telefono_publico: '+52 55 4567 8901',
    activo: true,
    foto_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    disponibilidad_json: {
      lunes: { activo: true, horas: ['08:00 - 10:00', '16:00 - 18:00'] },
      martes: { activo: true, horas: ['08:00 - 10:00', '16:00 - 18:00'] },
      miercoles: { activo: true, horas: ['08:00 - 10:00', '16:00 - 18:00'] },
      jueves: { activo: true, horas: ['08:00 - 10:00', '16:00 - 18:00'] },
      viernes: { activo: true, horas: ['08:00 - 10:00', '15:00 - 17:00'] },
      sabado: { activo: true, horas: ['10:00 - 13:00'] },
      domingo: { activo: false, horas: [] }
    }
  }
];
