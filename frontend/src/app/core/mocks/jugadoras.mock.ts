import { JugadoraPublica } from '../models';

export const MOCK_JUGADORAS: JugadoraPublica[] = [
  // Amazonas CDMX (Equipo 1)
  {
    id: 1,
    equipo_id: 1,
    nombre_deportivo: 'Valeria "La Rusa"',
    pronombres: 'Ella',
    dorsal: 10,
    posicion: 'Delantera',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Amazonas CDMX'
  },
  {
    id: 2,
    equipo_id: 1,
    nombre_deportivo: 'Mariana P.',
    pronombres: 'Ella',
    dorsal: 1,
    posicion: 'Portera',
    foto_url: null,
    autoriza_imagen: false, // Ghost Player: Renderiza avatar con silueta y dorsal 1
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Amazonas CDMX'
  },
  {
    id: 3,
    equipo_id: 1,
    nombre_deportivo: 'Camila Ríos',
    pronombres: 'Ella/Elle',
    dorsal: 7,
    posicion: 'Medio',
    foto_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Amazonas CDMX'
  },
  {
    id: 4,
    equipo_id: 1,
    nombre_deportivo: 'Lucía "Muro" Morales',
    pronombres: 'Ella',
    dorsal: 4,
    posicion: 'Defensa',
    foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Amazonas CDMX'
  },

  // Valquirias FC (Equipo 2)
  {
    id: 5,
    equipo_id: 2,
    nombre_deportivo: 'Dani Torres',
    pronombres: 'Elle',
    dorsal: 9,
    posicion: 'Delantera',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Valquirias FC'
  },
  {
    id: 6,
    equipo_id: 2,
    nombre_deportivo: 'Fer S.',
    pronombres: 'Ella',
    dorsal: 5,
    posicion: 'Medio',
    foto_url: null,
    autoriza_imagen: false, // Ghost Player
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Valquirias FC'
  },
  {
    id: 7,
    equipo_id: 2,
    nombre_deportivo: 'Andrea Galván',
    pronombres: 'Ella',
    dorsal: 1,
    posicion: 'Portera',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Valquirias FC'
  },

  // Centellas Diversas (Equipo 3)
  {
    id: 8,
    equipo_id: 3,
    nombre_deportivo: 'Sofi Luna',
    pronombres: 'Ella',
    dorsal: 8,
    posicion: 'Medio',
    foto_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Centellas Diversas'
  },
  {
    id: 9,
    equipo_id: 3,
    nombre_deportivo: 'Alex "Rayo" V.',
    pronombres: 'Elle',
    dorsal: 11,
    posicion: 'Delantera',
    foto_url: null,
    autoriza_imagen: false, // Ghost Player
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Centellas Diversas'
  },

  // Furia Violeta (Equipo 4)
  {
    id: 10,
    equipo_id: 4,
    nombre_deportivo: 'Renata Paz',
    pronombres: 'Ella',
    dorsal: 6,
    posicion: 'Defensa',
    foto_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: false,
    activo: true,
    nombre_equipo: 'Furia Violeta'
  },

  // Bolsa de Jugadoras Independientes (Sin equipo asignado)
  {
    id: 101,
    equipo_id: null,
    nombre_deportivo: 'Pau Navarro',
    pronombres: 'Ella',
    dorsal: null,
    posicion: 'Medio',
    foto_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: true,
    activo: true,
    nombre_equipo: 'Bolsa Independiente'
  },
  {
    id: 102,
    equipo_id: null,
    nombre_deportivo: 'Gaby M.',
    pronombres: 'Ella/Elle',
    dorsal: null,
    posicion: 'Portera',
    foto_url: null,
    autoriza_imagen: false, // Ghost Player
    es_independiente: true,
    activo: true,
    nombre_equipo: 'Bolsa Independiente'
  },
  {
    id: 103,
    equipo_id: null,
    nombre_deportivo: 'Sam Vega',
    pronombres: 'Elle',
    dorsal: null,
    posicion: 'Delantera',
    foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: true,
    activo: true,
    nombre_equipo: 'Bolsa Independiente'
  },
  {
    id: 104,
    equipo_id: null,
    nombre_deportivo: 'Ximena Castro',
    pronombres: 'Ella',
    dorsal: null,
    posicion: 'Defensa',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    autoriza_imagen: true,
    es_independiente: true,
    activo: true,
    nombre_equipo: 'Bolsa Independiente'
  }
];
