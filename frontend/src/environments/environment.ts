export const environment = {
  production: false,
  apiUrl: 'http://localhost/liga-femenil/backend/api',
  backendUrl: 'http://localhost/liga-femenil/backend',
  aiApiUrl: 'http://localhost:5000/api',
  // Qué partes de la app siguen usando datos simulados (true) en vez del backend (false).
  // Se van apagando conforme se conecta cada parte; al final se eliminan junto con los mocks.
  mocks: {
    torneo: false,        // posiciones, jornadas, partidos
    equipos: false,       // lista y ficha pública de equipos
    jugadoras: false,     // planteles públicos y registro de independientes
    entrenadores: true,   // pendiente: definir entrenadores.usuario_id con el backend
    instagram: true,      // pendiente: token de Meta
    admin: true           // lecturas privadas y escrituras de admin/representante (hasta tener login real)
  }
};
