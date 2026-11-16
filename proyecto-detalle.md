# Plataforma Digital - Liga de Fútbol Femenil & Comunidad Diversa

## 1. Visión y Propósito del Proyecto
* **Naturaleza:** Plataforma integral para una liga amateur de fútbol 7/femenil en México (11 equipos oficiales, partidos dominicales), combinada con una comunidad segura y marketplace de entrenamiento físico a domicilio.
* **Misión institucional:** "Fútbol con orgullo. Más que una liga, una comunidad". Espacio inclusivo, seguro y de empoderamiento para mujeres y la comunidad LGBT+.
* **Objetivo del concurso:** Desarrollar un sistema innovador, minimalista y de máxima usabilidad en 4 semanas para ganar un certamen tecnológico. El cliente principal a convencer es la **Directora del Programa**, a quien se le debe automatizar la captura operativa dominical y la visibilidad para patrocinios (marcas como Gatorade, fondos gubernamentales, ONU Mujeres).

---

## 2. Decisiones de Arquitectura y Stack Tecnológico
* **Frontend:** Angular (Standalone Components, TypeScript estricto, Mobile-First).
* **Backend Core:** PHP 8.x servido en Apache (XAMPP local) con conexión PDO a MySQL 8.x (`liga_femenil_db`, cotejamiento `utf8mb4_unicode_ci`) y phpMyAdmin. **Sin contenedores Docker.**
* **Microservicio IA Satélite:** Python 3.10+ con Flask corriendo en `http://localhost:5000` (`ai-service/`). Ofrece OCR multimodal de cédulas manuscritas (Gemini) con matching difuso contra la plantilla, parser de incidencias por voz y generación de contenido para Instagram. Requiere `GEMINI_API_KEY` en `ai-service/.env` (no se versiona).
* **Desacoplamiento del equipo (2 desarrolladores):**
  * **Compañero (Backend):** Base de datos, API REST en PHP, transacciones de partidos y servicio Python.
  * **Usuario (Frontend):** UI/UX en Angular, maquetación, animaciones, servicios reactivos y consumo de la API.

---

## 3. Reglas de Negocio del Torneo Deportivo
* **Equipos:** 11 escuadras oficiales en formato round-robin (todos contra todos, 11 jornadas dominicales, 5 partidos por jornada; en cada jornada un equipo descansa).
* **Duración:** 2 tiempos de 20 minutos con 5 minutos de descanso.
* **Regla de desempate:** Si al minuto 18 del segundo tiempo persiste el empate, se define por tanda de penales.
* **Puntuación oficial:** 
  * Ganador (tiempo regular o penales): **3 puntos**.
  * Perdedor (tiempo regular o penales): **0 puntos**.
* **Gestión y Captura:** Centralizada exclusivamente en la **Directora del Programa (Superadmin)**. Los equipos no editan marcadores ni tablas.
* **Disciplina:** Objetiva mediante registro de tarjetas amarillas y rojas (se descartó cualquier métrica subjetiva de Fair Play).

---

## 4. Pilares de Inclusión y Privacidad (Features Diferenciales)
> El Buzón Seguro Anónimo se descartó del alcance.

1. **Doble Capa de Identidad:**
   * *Datos públicos:* Nombre deportivo, pronombres y dorsal.
   * *Datos sensibles/privados:* Nombre legal, teléfono y contactos de emergencia (cifrados y visibles solo para la Directora para responsivas o seguros).
2. **Modo "Ghost Player" (Protección de Imagen):**
   * Campo booleano `autoriza_imagen`. Si es `false`, la interfaz renderiza un avatar con silueta y dorsal en lugar de su fotografía para proteger su identidad laboral/personal.
3. **Bolsa de Jugadoras Independientes:**
   * Formulario reactivo para chicas sin equipo, con match por nivel deportivo y afinidad de convivencia para su asignación por parte de la Directora.

---

## 5. Staff Oficial de Entrenadores
* Servicio oficial de acondicionamiento físico personalizado a domicilio (boxeo, karate, funcional, etc.).
* Perfil mixto (entrenadoras y entrenadores avalados por la liga).
* Cada perfil cuenta con bio, zonas de cobertura en la CDMX, tarifas por sesión y disponibilidad horaria semanal estructurada en formato JSON para facilitar solicitudes vía web y canalización a WhatsApp.

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
* **Animaciones Planificadas:**
  * Animaciones implementadas sin GSAP ni ScrollTrigger (textos que emergen con desenfoque suave, tarjetas de partidos en cascada, parallax sutil, hero con secuencia de frames en `public/frames2/`).

---

## 7. Esquema de Base de Datos MySQL (Referencia DDL)
El backend tiene acordadas las siguientes tablas principales:
1. `usuarios`: `id`, `email`, `password_hash`, `rol` ('superadmin', 'capitana'), `nombre_contacto`.
2. `equipos`: `id`, `capitana_id`, `nombre`, `escudo_url`, `video_url`.
3. `jugadoras`: `id`, `equipo_id`, `nombre_deportivo`, `pronombres`, `dorsal`, `posicion`, `foto_url`, `autoriza_imagen`, `nombre_legal`, `telefono_contacto`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`, `aviso_privacidad_aceptado`, `es_independiente`, `activo`.
4. `torneos`: `id`, `nombre`, `fecha_inicio`, `activo`.
5. `jornadas`: `id`, `torneo_id`, `numero_jornada`, `fecha_domingo`.
6. `partidos`: `id`, `jornada_id`, `equipo_local_id`, `equipo_visitante_id`, `horario`, `goles_local`, `goles_visitante`, `empate_minuto_18`, `penales_local`, `penales_visitante`, `ganador_id`, `estado`, `cancha`, `notas_mesa`.
7. `incidencias_partido`: `id`, `partido_id`, `jugadora_id`, `equipo_id`, `tipo` ('gol', 'autogol', 'tarjeta_amarilla', 'tarjeta_roja', 'falta'), `minuto`.
8. `entrenadores`: `id`, `nombre_completo`, `disciplinas`, `zonas_cobertura`, `bio`, `precio_sesion`, `telefono_publico`, `disponibilidad_json`, `activo` (Catálogo público gestionado por la liga).

---

## 8. Contrato de API Acordado (JSON Global)
Todas las respuestas de PHP responden con la firma:
```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Rutas clave a consumir por el frontend:
* `GET /api/torneo/posiciones.php` (Tabla con PJ, PG, PE, PP, GF, GC, DG, Pts calculados).
* `GET /api/torneo/jornadas.php?torneo_id=1` (Calendario de las 11 fechas con partidos).
* `GET /api/equipos.php` (11 equipos y fichas con jugadoras públicas).
* `POST /api/jugadoras/independientes.php` (Alta en bolsa).
* `GET /api/entrenadores.php` (Catálogo con matriz horaria).
* `POST /api/admin/partidos/guardar-acta.php` (Captura transaccional de la Directora).

---

## 9. Estado Actual y Siguientes Pasos
* **Frontend (Angular 22):** implementado con datos simulados (`environment.useMock: true`).
  * Público: inicio (hero, partidos, posiciones, Instagram, entrenadores), jornadas, posiciones y comunidad (equipos, destacadas, bolsa de independientes).
  * Login y portal de representante (capitana).
  * Panel de la Directora: registrar partido (con escaneo de cédula por IA y dictado por voz), programar calendario, equipos, jugadoras, entrenadores y generador de contenido para Instagram.
  * El login es demostrativo (credenciales locales, sesión en `localStorage`). Faltan guards de ruta.
* **Base de datos (`database/`):** `liga.sql` (esquema, datos y las vistas `vista_posiciones` y `vista_porteria`), más scripts de seed y scripts de sincronización de fotos y escudos.
* **Servicio de IA (`ai-service/`):** Flask en el puerto 5000, con pruebas.
* **Backend PHP (`backend/`):** solo existe `api/instagram/posts.php`.
* **Pendiente:**
  1. Endpoints PHP del contrato (sección 8) y autenticación real.
  2. Cambiar `useMock` a `false` e integrar con la API real.
  3. Guards de rutas y protección de datos sensibles.
