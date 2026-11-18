# Plataforma Digital - Liga de Fútbol Femenil & Comunidad Diversa

## 1. Visión y Propósito del Proyecto
* **Naturaleza:** Plataforma integral para una liga amateur de fútbol 7/femenil en México (11 equipos oficiales, partidos dominicales), combinada con una comunidad segura y marketplace de entrenamiento físico a domicilio.
* **Misión institucional:** "Fútbol con orgullo. Más que una liga, una comunidad". Espacio inclusivo, seguro y de empoderamiento para mujeres y la comunidad LGBT+.
* **Objetivo del concurso:** Desarrollar un sistema innovador, minimalista y de máxima usabilidad en 4 semanas para ganar un certamen tecnológico. El cliente principal a convencer es la **Directora del Programa**, a quien se le debe automatizar la captura operativa dominical y la visibilidad para patrocinios (marcas como Gatorade, fondos gubernamentales, ONU Mujeres).

---

## 2. Decisiones de Arquitectura y Stack Tecnológico
* **Frontend:** Angular (Standalone Components, TypeScript estricto, Mobile-First).
* **Backend Core:** PHP 8.2 servido en Apache (XAMPP local) con conexión `mysqli` y consultas preparadas a MariaDB 10.4 (`liga_femenil_db`, cotejamiento `utf8mb4_unicode_ci`) y phpMyAdmin. **Sin contenedores Docker.**
* **Microservicio IA Satélite:** Python 3.10+ con Flask corriendo en `http://localhost:5000` (`ai-service/`). Ofrece OCR multimodal de cédulas manuscritas (Gemini) con matching difuso contra la plantilla, parser de incidencias por voz y generación de contenido para Instagram. Requiere `GEMINI_API_KEY` en `ai-service/.env` (no se versiona).
* **Desacoplamiento del equipo (2 desarrolladores):**
  * **Compañero (Backend):** Base de datos, API en PHP, transacciones de partidos y servicio Python.
  * **Usuario (Frontend):** UI/UX en Angular, maquetación, animaciones, servicios reactivos y consumo de la API.

---

## 3. Reglas de Negocio del Torneo Deportivo
* **Equipos:** 11 escuadras oficiales en formato round-robin (todos contra todos, 11 jornadas dominicales, 5 partidos por jornada; en cada jornada un equipo descansa).
* **Duración:** 2 tiempos de 20 minutos con 5 minutos de descanso.
* **Regla de desempate:** Si al minuto 18 del segundo tiempo persiste el empate, se define por tanda de penales.
* **Puntuación oficial:** 
  * Ganador (tiempo regular o penales): **3 puntos**.
  * Perdedor (tiempo regular o penales): **0 puntos**.
* **Gestión y Captura:** Centralizada exclusivamente en la **Directora del Programa (Superadmin)**. Los equipos no editan marcadores ni tablas; cada capitana solo administra los datos de su club y su plantel.
* **Validación en el servidor:** el backend calcula el ganador a partir del marcador (o de los penales si hubo empate) y rechaza un partido finalizado empatado sin tanda de penales.
* **Disciplina:** Objetiva mediante registro de tarjetas amarillas y rojas (se descartó cualquier métrica subjetiva de Fair Play).

---

## 4. Pilares de Inclusión y Privacidad (Features Diferenciales)
> El Buzón Seguro Anónimo se descartó del alcance.

1. **Doble Capa de Identidad:**
   * *Datos públicos:* Nombre deportivo y dorsal.
   * *Datos sensibles/privados:* Nombre legal, edad, teléfono y contacto de emergencia (con parentesco). Solo los ven la Directora y la capitana del equipo de la jugadora; las consultas públicas no los devuelven.
   * *Datos de salud:* Tipo de sangre y alergias/condiciones se guardan aparte, en `jugadoras_datos_medicos`, por ser datos personales sensibles (LFPDPPP). Mismo acceso que los datos privados.
2. **Modo "Ghost Player" (Protección de Imagen):**
   * Campo booleano `autoriza_imagen`. Si es `false`, la interfaz renderiza un avatar con silueta y dorsal en lugar de su fotografía para proteger su identidad laboral/personal.
   * El servidor tampoco envía la foto en las consultas públicas (ficha del equipo y jugadoras destacadas), así que no se puede obtener inspeccionando el navegador.
3. **Bolsa de Jugadoras Independientes:**
   * Formulario público para chicas sin equipo: posición, nivel de experiencia (Iniciación, Intermedio o Avanzado), datos personales y de salud. Genera un folio (`IND-00000`).
   * La Directora ve la bolsa en su panel y asigna a cada jugadora a un equipo con su dorsal.

---

## 5. Staff Oficial de Entrenadores
* Servicio oficial de acondicionamiento físico personalizado a domicilio (boxeo, karate, funcional, etc.).
* Perfil mixto (entrenadoras y entrenadores avalados por la liga).
* Cada perfil cuenta con bio, foto, zonas de cobertura en la CDMX, tarifas por sesión y disponibilidad horaria semanal estructurada en formato JSON para facilitar solicitudes vía web y canalización a WhatsApp.
* Los entrenadores no tienen cuenta de usuario: los da de alta, edita y pausa la Directora. El catálogo público solo muestra los activos.

---

## 6. Sistema de Diseño Frontend (Warm Editorial / Soft Aesthetic)
* **Vibe Visual:** Minimalista, cálido, acogedor y cercano. Sin clichés estridentes ni estética de fútbol tosco masculino.
* **Paleta de Colores:**
  * Base lienzo: Tonos arenosos suaves / Blanco roto (`#FAF7F2`, `#F5F2EB`).
  * Superficies: Blanco puro (`#FFFFFF`) con bordes sutiles en lino (`#ECE6DE`) y sombras ambientales muy difusas.
  * Dorado institucional suavizado: Mate champaña (`#C5A059`, `#EBDCBA`).
  * Acentos Orgullo Pastel: Gradiente difuso/lechoso (*soft pride mesh*) con lavanda, melocotón tierno, menta apagado y cielo suave.
* **Tipografía:**
  * Títulos/Display: *Fraunces* (Serif editorial cálida).
  * Textos/Datos: *Plus Jakarta Sans* o *Inter* (Sans-serif limpia y legible).
* **Navegación Móvil:**
  * Experiencia de aplicación nativa mediante **Bottom Navigation Bar fija** en forma de cápsula (*pill floating nav*) con efecto vidrio translúcido (*backdrop-filter: blur*):
    * 🏠 Inicio | 📅 Jornadas | 🏆 Posiciones | 🤝 Comunidad
* **Animaciones:**
  * Animaciones implementadas sin GSAP ni ScrollTrigger (textos que emergen con desenfoque suave, tarjetas de partidos en cascada, parallax sutil, hero con secuencia de frames en `public/frames2/`).

---

## 7. Esquema de Base de Datos
`database/liga.sql` crea las tablas, las vistas y los datos iniciales: 12 usuarios, 11 equipos, 165 jugadoras, 1 torneo, 11 jornadas, 55 partidos, 52 incidencias y 6 entrenadores.

1. `usuarios`: `id`, `email`, `password_hash` (bcrypt), `rol` ('superadmin', 'capitana'), `nombre_contacto`, `creado_en`.
2. `equipos`: `id`, `capitana_id`, `nombre`, `escudo_url`, `video_url`, `activo`, `creado_en`.
3. `jugadoras`: `id`, `equipo_id` (NULL = bolsa de independientes), `nombre_deportivo`, `dorsal`, `posicion`, `nivel_experiencia`, `edad`, `foto_url`, `autoriza_imagen`, `nombre_legal`, `telefono_contacto`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`, `contacto_emergencia_parentesco`, `aviso_privacidad_aceptado`, `es_independiente`, `activo`, `creado_en`.
4. `jugadoras_datos_medicos`: `jugadora_id` (llave y FK con borrado en cascada), `tipo_sangre`, `alergias_condiciones`, `actualizado_en`.
5. `torneos`: `id`, `nombre`, `fecha_inicio`, `activo`.
6. `jornadas`: `id`, `torneo_id`, `numero_jornada`, `fecha_domingo`.
7. `partidos`: `id`, `jornada_id`, `equipo_local_id`, `equipo_visitante_id`, `horario`, `goles_local`, `goles_visitante`, `empate_minuto_18`, `penales_local`, `penales_visitante`, `ganador_id`, `estado` ('programado', 'en_juego', 'finalizado', 'suspendido'), `cancha`, `notas_mesa`.
8. `incidencias_partido`: `id`, `partido_id`, `jugadora_id`, `equipo_id`, `tipo` ('gol', 'autogol', 'tarjeta_amarilla', 'tarjeta_roja', 'falta'), `minuto`.
9. `entrenadores`: `id`, `nombre_completo`, `disciplinas`, `zonas_cobertura`, `bio`, `precio_sesion`, `telefono_publico`, `disponibilidad_json`, `foto_url`, `activo`.

**Vistas:**
* `vista_posiciones`: PJ, PG, PP, GF, GC, DG y Pts de cada equipo activo (3 puntos por victoria), ordenada por Pts, DG, GF y nombre. También calcula PE, que siempre es 0 porque no hay empates; el frontend no lo muestra.
* `vista_porteria`: vallas invictas y promedio por equipo.

**Reglas de datos:**
* Las bajas de equipos y jugadoras son lógicas (`activo = 0`) para conservar sus goles y tarjetas en las actas.
* Fueras de juego y sustituciones no tienen tipo de incidencia; el acta las guarda como texto en `notas_mesa`.

---

## 8. API del Backend (`backend/`)
Cada archivo PHP recibe un `POST` con cuerpo JSON y un campo `filtro` que elige la operación:
```json
{ "filtro": "jornadas", "torneo_id": 1 }
```
* Las consultas responden los datos directamente (un arreglo o un objeto).
* Las escrituras responden `{ "ok": true, ... }`.
* Los errores responden `{ "ok": false, "error": "mensaje" }`, con código 400 (datos inválidos), 401 (sin sesión), 403 (rol no permitido) o 404 (no existe).

La sesión es una cookie `HttpOnly` de PHP; el frontend la envía con `withCredentials`. El backend valida el rol en cada operación protegida.

| Archivo | Filtro | Acceso | Qué hace |
|---|---|---|---|
| `auth.php` | `login`, `sesion`, `logout` | Público | Inicia, consulta y cierra la sesión |
| `consulta.php` | `posiciones` | Público | Tabla con racha de los últimos 4 partidos |
| | `jornadas` | Público | 11 jornadas con partidos e incidencias (las notas de mesa solo para la Directora) |
| | `equipos`, `equipo_detalle` | Público | Equipos activos y ficha con plantel público |
| | `lideres` | Público | Goleadoras, porteras y figura de la última jornada |
| | `entrenadores` | Público | Catálogo de entrenadores activos |
| | `jugadoras_admin` | Directora | Padrón completo con datos privados y médicos |
| | `plantel_privado` | Directora o capitana del equipo | Plantel con datos privados y médicos |
| | `entrenadores_admin` | Directora | Catálogo completo, incluidos los pausados |
| `registrar.php` | `jugadora_independiente` | Público | Alta en la bolsa; devuelve el folio |
| | `jugadora` | Directora o capitana (solo en su equipo) | Alta de jugadora |
| | `equipo`, `entrenador` | Directora | Alta de equipo o entrenador |
| | `guardar_acta` | Directora | Marcador, penales, estado, notas e incidencias en una transacción |
| `modificar.php` | `equipo` | Directora o capitana (solo su club) | Editar club |
| | `jugadora`, `baja_jugadora` | Directora o capitana (solo su plantel) | Editar ficha (incluye asignar equipo o mandar a la bolsa) y dar de baja |
| | `baja_equipo` | Directora | Baja lógica del club |
| | `entrenador`, `entrenador_estado`, `baja_entrenador` | Directora | Editar, pausar o eliminar entrenador |
| | `calendario` | Directora | Fecha de la jornada y horario, cancha, localía y suspensión de cada partido no jugado |
| `subir_imagen.php` | (multipart: `tipo`, `imagen`) | Directora o capitana | Sube escudo o foto (JPG, PNG o WebP, máx. 3 MB) y devuelve su URL |
| `api/instagram/posts.php` | (GET) | Público | Publicaciones de Instagram |

Archivos de apoyo: `comun.php` (CORS, conexión, sesión y roles) y `validaciones.php` (reglas de jugadoras y entrenadores).

**Servicio de IA (`ai-service/`, Flask, `http://localhost:5000/api`):** `GET /health`, `POST /cedula/scan`, `POST /voice/parse-incident`, `POST /voice/process-audio` y `POST /ig/generate-content`.

---

## 9. Estado Actual
* **Frontend (Angular 22):** conectado al backend real en todas las pantallas. Solo Instagram usa publicaciones de muestra (`environment.mocks.instagram`).
  * Público: inicio, jornadas, posiciones (con podio y racha), comunidad (equipos con video, jugadoras destacadas y registro a la bolsa).
  * Panel de la Directora: registrar partido (con escaneo de cédula por IA y dictado por voz), programar calendario, equipos, jugadoras, entrenadores y generador de contenido para Instagram.
  * Portal de la capitana: datos de su club y su plantel.
  * Login real, guards por rol y redirección al login con aviso si la sesión expira.
* **Base de datos:** `database/liga.sql` es la única fuente; `database/cambiar_password.php` cambia contraseñas desde la terminal.
* **Seguridad local:** `.htaccess` bloquea el acceso web a `.git`, `.env`, `ai-service/` y `database/`; `backend/uploads/` no ejecuta scripts.
* **Pendiente:**
  1. Probar desde la pantalla el escaneo de cédula y el dictado por voz guardando actas reales.
  2. Apagar el modo debug de Flask y limitarlo a `127.0.0.1` (hoy escucha en toda la red).
  3. Sustituir los datos de relleno de las jugadoras (nombre legal, teléfonos y tipo de sangre) y dar una contraseña propia a cada capitana.
  4. Si se publica en internet: URLs, CORS, cookies seguras y permisos de `backend/uploads/` para el servidor.

---

## 10. Puesta en Marcha Local
1. Iniciar Apache y MySQL de XAMPP (`sudo /opt/lampp/lampp start`).
2. Crear la base `liga_femenil_db` (`utf8mb4_unicode_ci`) e importar `database/liga.sql`.
3. Servicio de IA: crear `ai-service/.env` con `GEMINI_API_KEY=...` y ejecutar `cd ai-service && venv/bin/python app.py`. No arranca solo al reiniciar la máquina.
4. Frontend: `cd frontend && npm install && npm start` y abrir `http://localhost:4200`.

Credenciales de demostración en `frontend/README.md`.
