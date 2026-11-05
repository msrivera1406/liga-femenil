CREATE DATABASE IF NOT EXISTS liga_femenil_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE liga_femenil_db;

-- 1. USUARIOS Y CONTROL DE ACCESO
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('superadmin', 'capitana') NOT NULL DEFAULT 'capitana',
    nombre_contacto VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. EQUIPOS (Sin campos de colores)
CREATE TABLE equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capitana_id INT NULL,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    escudo_url VARCHAR(255) NULL,
    video_url VARCHAR(255) NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipo_capitana FOREIGN KEY (capitana_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. JUGADORAS (Identidad Dual, Privacidad y Compliance)
CREATE TABLE jugadoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NULL,
    -- Identidad pública y deportiva
    nombre_deportivo VARCHAR(80) NOT NULL,
    pronombres VARCHAR(30) DEFAULT 'Ella',
    dorsal TINYINT UNSIGNED NULL,
    posicion ENUM('Portera', 'Defensa', 'Medio', 'Delantera') NOT NULL,
    foto_url VARCHAR(255) NULL,
    -- Privacidad y protección de imagen (Ghost Player)
    autoriza_imagen BOOLEAN NOT NULL DEFAULT FALSE,
    -- Datos privados/sensibles (solo accesibles por la Directora)
    nombre_legal VARCHAR(120) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    contacto_emergencia_nombre VARCHAR(100) NOT NULL,
    contacto_emergencia_telefono VARCHAR(20) NOT NULL,
    aviso_privacidad_aceptado BOOLEAN NOT NULL DEFAULT TRUE,
    -- Estado en la liga
    es_independiente BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jugadora_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. TORNEOS Y JORNADAS
CREATE TABLE torneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE jornadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    torneo_id INT NOT NULL,
    numero_jornada TINYINT UNSIGNED NOT NULL,
    fecha_domingo DATE NOT NULL,
    CONSTRAINT fk_jornada_torneo FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. PARTIDOS (Regla de 3 pts al ganador, sin fair play subjetivo)
CREATE TABLE partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jornada_id INT NOT NULL,
    equipo_local_id INT NOT NULL,
    equipo_visitante_id INT NOT NULL,
    horario TIME NOT NULL,
    goles_local TINYINT UNSIGNED DEFAULT 0,
    goles_visitante TINYINT UNSIGNED DEFAULT 0,
    empate_minuto_18 BOOLEAN DEFAULT FALSE,
    penales_local TINYINT UNSIGNED NULL,
    penales_visitante TINYINT UNSIGNED NULL,
    ganador_id INT NULL,
    estado ENUM('programado', 'en_juego', 'finalizado', 'suspendido') NOT NULL DEFAULT 'programado',
    cancha VARCHAR(50) DEFAULT 'Cancha 1',
    notas_mesa TEXT NULL,
    CONSTRAINT fk_partido_jornada FOREIGN KEY (jornada_id) REFERENCES jornadas(id) ON DELETE CASCADE,
    CONSTRAINT fk_partido_local FOREIGN KEY (equipo_local_id) REFERENCES equipos(id),
    CONSTRAINT fk_partido_visitante FOREIGN KEY (equipo_visitante_id) REFERENCES equipos(id),
    CONSTRAINT fk_partido_ganador FOREIGN KEY (ganador_id) REFERENCES equipos(id)
) ENGINE=InnoDB;

-- 6. INCIDENCIAS / ACTA ARBITRAL DETALLADA
CREATE TABLE incidencias_partido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partido_id INT NOT NULL,
    jugadora_id INT NOT NULL,
    equipo_id INT NOT NULL,
    tipo ENUM('gol', 'autogol', 'tarjeta_amarilla', 'tarjeta_roja', 'falta') NOT NULL,
    minuto TINYINT UNSIGNED NOT NULL,
    CONSTRAINT fk_incidencia_partido FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_incidencia_jugadora FOREIGN KEY (jugadora_id) REFERENCES jugadoras(id),
    CONSTRAINT fk_incidencia_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id)
) ENGINE=InnoDB;

-- 7. STAFF DE ENTRENADORES OFICIALES (Catálogo administrativo público)
CREATE TABLE entrenadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    disciplinas VARCHAR(150) NOT NULL, -- Ej: 'Boxeo, Karate, Acondicionamiento funcional'
    zonas_cobertura VARCHAR(200) NOT NULL, -- Alcaldías o zonas a domicilio
    bio TEXT NOT NULL,
    precio_sesion DECIMAL(8,2) NOT NULL,
    telefono_publico VARCHAR(20) NOT NULL,
    disponibilidad_json JSON NULL, -- Matriz semanal de días y horarios
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;
