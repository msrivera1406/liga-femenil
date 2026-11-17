USE liga_femenil_db;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE incidencias_partido;
TRUNCATE TABLE partidos;
TRUNCATE TABLE jugadoras;
TRUNCATE TABLE equipos;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE torneos;
TRUNCATE TABLE jornadas;
SET FOREIGN_KEY_CHECKS = 1;

-- Torneo Oficial 4.ª Edición
INSERT INTO torneos (id, nombre, fecha_inicio, activo) VALUES (1, '4.ª Edición - Liga de Fútbol Mujeres Diversas México', '2026-11-01', 1);

-- Usuario Superadmin (password: Admin2026!)
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (1, 'admin@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'superadmin', 'Directora de Liga');

-- Capitana de QUEER GOALS
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (2, 'capitana.queergoals@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana QUEER GOALS');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (1, 2, 'QUEER GOALS', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de QUEER GOALS (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(1, 1, 'Mariana López Hernández', 1, 'Portera', NULL, 1, 'Mariana López Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(2, 1, 'Daniela Ramírez Cruz', 2, 'Defensa', NULL, 1, 'Daniela Ramírez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(3, 1, 'Fernanda Castillo Morales', 3, 'Defensa', NULL, 1, 'Fernanda Castillo Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(4, 1, 'Andrea Sánchez Flores', 4, 'Defensa', NULL, 1, 'Andrea Sánchez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(5, 1, 'Paola Jiménez Torres', 5, 'Defensa', NULL, 1, 'Paola Jiménez Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(6, 1, 'Valeria Mendoza Ruiz', 6, 'Medio', NULL, 1, 'Valeria Mendoza Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(7, 1, 'Karla Pérez García', 7, 'Medio', NULL, 1, 'Karla Pérez García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(8, 1, 'Alejandra Reyes Luna', 8, 'Medio', NULL, 1, 'Alejandra Reyes Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(9, 1, 'Gabriela Ortiz Vega', 10, 'Medio', NULL, 1, 'Gabriela Ortiz Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(10, 1, 'Sofía Navarro Díaz', 9, 'Delantera', NULL, 1, 'Sofía Navarro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(11, 1, 'Natalia Romero Silva', 11, 'Delantera', NULL, 1, 'Natalia Romero Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(12, 1, 'Brenda Aguilar Ríos', 12, 'Delantera', NULL, 1, 'Brenda Aguilar Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(13, 1, 'Ximena Flores Castro', 13, 'Medio', NULL, 1, 'Ximena Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(14, 1, 'Melissa Vargas León', 14, 'Defensa', NULL, 1, 'Melissa Vargas León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(15, 1, 'Regina Torres Méndez', 15, 'Delantera', NULL, 1, 'Regina Torres Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de VALQUIRIAS
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (3, 'capitana.valquirias@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana VALQUIRIAS');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (2, 3, 'VALQUIRIAS', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de VALQUIRIAS (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(16, 2, 'Laura Martínez Silva', 1, 'Portera', NULL, 1, 'Laura Martínez Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(17, 2, 'Mónica Herrera López', 2, 'Defensa', NULL, 1, 'Mónica Herrera López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(18, 2, 'Itzel García Romero', 3, 'Defensa', NULL, 1, 'Itzel García Romero', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(19, 2, 'Claudia Sánchez Rivas', 4, 'Defensa', NULL, 1, 'Claudia Sánchez Rivas', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(20, 2, 'Jimena Morales Cruz', 5, 'Defensa', NULL, 1, 'Jimena Morales Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(21, 2, 'Diana Flores Mendoza', 6, 'Medio', NULL, 1, 'Diana Flores Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(22, 2, 'Renata Pérez Castillo', 7, 'Medio', NULL, 1, 'Renata Pérez Castillo', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(23, 2, 'Araceli Torres Jiménez', 8, 'Medio', NULL, 1, 'Araceli Torres Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(24, 2, 'Lucía Ramírez Vega', 10, 'Medio', NULL, 1, 'Lucía Ramírez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(25, 2, 'Evelyn Reyes Navarro', 9, 'Delantera', NULL, 1, 'Evelyn Reyes Navarro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(26, 2, 'Abril Castro Díaz', 11, 'Delantera', NULL, 1, 'Abril Castro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(27, 2, 'Karina León Aguilar', 12, 'Delantera', NULL, 1, 'Karina León Aguilar', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(28, 2, 'Fátima Ríos Hernández', 13, 'Medio', NULL, 1, 'Fátima Ríos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(29, 2, 'Verónica Luna Ortiz', 14, 'Defensa', NULL, 1, 'Verónica Luna Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(30, 2, 'Natalia Méndez Ruiz', 15, 'Delantera', NULL, 1, 'Natalia Méndez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de GOOD VIBES
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (4, 'capitana.goodvibes@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana GOOD VIBES');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (3, 4, 'GOOD VIBES', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de GOOD VIBES (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(31, 3, 'Alejandra Sánchez López', 1, 'Portera', NULL, 1, 'Alejandra Sánchez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(32, 3, 'Blanca Andrade Pérez', 2, 'Defensa', NULL, 1, 'Blanca Andrade Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(33, 3, 'Carolina Jiménez Ríos', 3, 'Defensa', NULL, 1, 'Carolina Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(34, 3, 'Jessica Morales Vega', 4, 'Defensa', NULL, 1, 'Jessica Morales Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(35, 3, 'Paulina Castro Ruiz', 5, 'Defensa', NULL, 1, 'Paulina Castro Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(36, 3, 'Mariana Torres Flores', 6, 'Medio', NULL, 1, 'Mariana Torres Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(37, 3, 'Andrea Navarro Cruz', 7, 'Medio', NULL, 1, 'Andrea Navarro Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(38, 3, 'Leslie Ramírez García', 8, 'Medio', NULL, 1, 'Leslie Ramírez García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(39, 3, 'Gabriela Mendoza Silva', 10, 'Medio', NULL, 1, 'Gabriela Mendoza Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(40, 3, 'Valentina Romero Díaz', 9, 'Delantera', NULL, 1, 'Valentina Romero Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(41, 3, 'Michelle Reyes Hernández', 11, 'Delantera', NULL, 1, 'Michelle Reyes Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(42, 3, 'Brenda Ortiz Luna', 12, 'Delantera', NULL, 1, 'Brenda Ortiz Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(43, 3, 'Fernanda Aguilar León', 13, 'Medio', NULL, 1, 'Fernanda Aguilar León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(44, 3, 'Sofía Herrera Méndez', 14, 'Defensa', NULL, 1, 'Sofía Herrera Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(45, 3, 'Natalia Castillo Rivas', 15, 'Delantera', NULL, 1, 'Natalia Castillo Rivas', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de ALL STARS GV
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (5, 'capitana.allstars@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana ALL STARS GV');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (4, 5, 'ALL STARS GV', 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de ALL STARS GV (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(46, 4, 'Daniela Flores Martínez', 1, 'Portera', NULL, 1, 'Daniela Flores Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(47, 4, 'Paola Ramírez López', 2, 'Defensa', NULL, 1, 'Paola Ramírez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(48, 4, 'Karla Mendoza Cruz', 3, 'Defensa', NULL, 1, 'Karla Mendoza Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(49, 4, 'Ingrid Santana Moya', 4, 'Defensa', NULL, 1, 'Ingrid Santana Moya', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(50, 4, 'Ximena Torres García', 5, 'Defensa', NULL, 1, 'Ximena Torres García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(51, 4, 'Melissa Jiménez Ríos', 6, 'Medio', NULL, 1, 'Melissa Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(52, 4, 'Mariana Reyes Silva', 7, 'Medio', NULL, 1, 'Mariana Reyes Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(53, 4, 'Regina Navarro Pérez', 8, 'Medio', NULL, 1, 'Regina Navarro Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(54, 4, 'Andrea Castillo Vega', 10, 'Medio', NULL, 1, 'Andrea Castillo Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(55, 4, 'Valeria Ortiz Hernández', 9, 'Delantera', NULL, 1, 'Valeria Ortiz Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(56, 4, 'Sofía León Morales', 11, 'Delantera', NULL, 1, 'Sofía León Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(57, 4, 'Fernanda Aguilar Ruiz', 12, 'Delantera', NULL, 1, 'Fernanda Aguilar Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(58, 4, 'Lucía Herrera Díaz', 13, 'Medio', NULL, 1, 'Lucía Herrera Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(59, 4, 'Diana Romero Flores', 14, 'Defensa', NULL, 1, 'Diana Romero Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(60, 4, 'Natalia Sánchez Luna', 15, 'Delantera', NULL, 1, 'Natalia Sánchez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de TBD UNITED
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (6, 'capitana.tbd@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana TBD UNITED');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (5, 6, 'TBD UNITED', 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de TBD UNITED (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(61, 5, 'Gabriela Martínez Cruz', 1, 'Portera', NULL, 1, 'Gabriela Martínez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(62, 5, 'Fernanda López Ríos', 2, 'Defensa', NULL, 1, 'Fernanda López Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(63, 5, 'Alejandra Torres Silva', 3, 'Defensa', NULL, 1, 'Alejandra Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(64, 5, 'Daniela Pérez Mendoza', 4, 'Defensa', NULL, 1, 'Daniela Pérez Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(65, 5, 'Karina Romero Vega', 5, 'Defensa', NULL, 1, 'Karina Romero Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(66, 5, 'Valeria Sánchez Ruiz', 6, 'Medio', NULL, 1, 'Valeria Sánchez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(67, 5, 'Mónica Castillo Flores', 7, 'Medio', NULL, 1, 'Mónica Castillo Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(68, 5, 'Itzel Navarro Hernández', 8, 'Medio', NULL, 1, 'Itzel Navarro Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(69, 5, 'Paola Aguilar Díaz', 10, 'Medio', NULL, 1, 'Paola Aguilar Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(70, 5, 'Regina Morales León', 9, 'Delantera', NULL, 1, 'Regina Morales León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(71, 5, 'Jimena Reyes Ortiz', 11, 'Delantera', NULL, 1, 'Jimena Reyes Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(72, 5, 'Andrea García Luna', 12, 'Delantera', NULL, 1, 'Andrea García Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(73, 5, 'Laura Méndez Castro', 13, 'Medio', NULL, 1, 'Laura Méndez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(74, 5, 'Evelyn Ríos Jiménez', 14, 'Defensa', NULL, 1, 'Evelyn Ríos Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(75, 5, 'Ximena Herrera Ramírez', 15, 'Delantera', NULL, 1, 'Ximena Herrera Ramírez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de UNKNOWN
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (7, 'capitana.unknown@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana UNKNOWN');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (6, 7, 'UNKNOWN', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de UNKNOWN (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(76, 6, 'Claudia Ramírez Flores', 1, 'Portera', NULL, 1, 'Claudia Ramírez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(77, 6, 'Natalia Pérez López', 2, 'Defensa', NULL, 1, 'Natalia Pérez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(78, 6, 'Melissa Torres Cruz', 3, 'Defensa', NULL, 1, 'Melissa Torres Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(79, 6, 'Diana Sánchez Vega', 4, 'Defensa', NULL, 1, 'Diana Sánchez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(80, 6, 'Abril Mendoza Ruiz', 5, 'Defensa', NULL, 1, 'Abril Mendoza Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(81, 6, 'Valentina García Ríos', 6, 'Medio', NULL, 1, 'Valentina García Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(82, 6, 'Jessica Navarro Silva', 7, 'Medio', NULL, 1, 'Jessica Navarro Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(83, 6, 'Fátima Romero Díaz', 8, 'Medio', NULL, 1, 'Fátima Romero Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(84, 6, 'Mariana Ortiz Hernández', 10, 'Medio', NULL, 1, 'Mariana Ortiz Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(85, 6, 'Karla Castillo Morales', 9, 'Delantera', NULL, 1, 'Karla Castillo Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(86, 6, 'Paola Herrera León', 11, 'Delantera', NULL, 1, 'Paola Herrera León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(87, 6, 'Renata Aguilar Méndez', 12, 'Delantera', NULL, 1, 'Renata Aguilar Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(88, 6, 'Sofía Jiménez Luna', 13, 'Medio', NULL, 1, 'Sofía Jiménez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(89, 6, 'Andrea Flores Castro', 14, 'Defensa', NULL, 1, 'Andrea Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(90, 6, 'Verónica Reyes Martínez', 15, 'Delantera', NULL, 1, 'Verónica Reyes Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de F.C. LIONESSES
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (8, 'capitana.lionesses@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana F.C. LIONESSES');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (7, 8, 'F.C. LIONESSES', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de F.C. LIONESSES (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(91, 7, 'Jessica Aguilar Torres', 1, 'Portera', NULL, 1, 'Jessica Aguilar Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(92, 7, 'Fernanda López García', 2, 'Defensa', NULL, 1, 'Fernanda López García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(93, 7, 'Mariana Castillo Ruiz', 3, 'Defensa', NULL, 1, 'Mariana Castillo Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(94, 7, 'Daniela Romero Cruz', 4, 'Defensa', NULL, 1, 'Daniela Romero Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(95, 7, 'Karla Sánchez Vega', 5, 'Defensa', NULL, 1, 'Karla Sánchez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(96, 7, 'Valeria Martínez Flores', 6, 'Medio', NULL, 1, 'Valeria Martínez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(97, 7, 'Alejandra Mendoza Díaz', 7, 'Medio', NULL, 1, 'Alejandra Mendoza Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(98, 7, 'Ximena Ramírez Ortiz', 8, 'Medio', NULL, 1, 'Ximena Ramírez Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(99, 7, 'Natalia Herrera Silva', 10, 'Medio', NULL, 1, 'Natalia Herrera Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(100, 7, 'Paola Reyes Luna', 9, 'Delantera', NULL, 1, 'Paola Reyes Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(101, 7, 'Regina Jiménez Ríos', 11, 'Delantera', NULL, 1, 'Regina Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(102, 7, 'Gabriela Navarro León', 12, 'Delantera', NULL, 1, 'Gabriela Navarro León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(103, 7, 'Lucía Pérez Morales', 13, 'Medio', NULL, 1, 'Lucía Pérez Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(104, 7, 'Evelyn Torres Hernández', 14, 'Defensa', NULL, 1, 'Evelyn Torres Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(105, 7, 'Mónica Flores Castro', 15, 'Delantera', NULL, 1, 'Mónica Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de BANDIDAS F.C.
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (9, 'capitana.bandidas@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana BANDIDAS F.C.');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (8, 9, 'BANDIDAS F.C.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de BANDIDAS F.C. (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(106, 8, 'Andrea Morales Ríos', 1, 'Portera', NULL, 1, 'Andrea Morales Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(107, 8, 'Esmeralda Sosa Martínez', 2, 'Defensa', NULL, 1, 'Esmeralda Sosa Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(108, 8, 'Paulina García López', 3, 'Defensa', NULL, 1, 'Paulina García López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(109, 8, 'Diana Reyes Cruz', 4, 'Defensa', NULL, 1, 'Diana Reyes Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(110, 8, 'Jimena Navarro Vega', 5, 'Defensa', NULL, 1, 'Jimena Navarro Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(111, 8, 'Karina Torres Silva', 6, 'Medio', NULL, 1, 'Karina Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(112, 8, 'Fernanda Castillo Ruiz', 7, 'Medio', NULL, 1, 'Fernanda Castillo Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(113, 8, 'Valeria Mendoza Flores', 8, 'Medio', NULL, 1, 'Valeria Mendoza Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(114, 8, 'Brenda Ramírez Díaz', 10, 'Medio', NULL, 1, 'Brenda Ramírez Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(115, 8, 'Sofía Aguilar Hernández', 9, 'Delantera', NULL, 1, 'Sofía Aguilar Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(116, 8, 'Mariana Pérez León', 11, 'Delantera', NULL, 1, 'Mariana Pérez León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(117, 8, 'Regina Herrera Ortiz', 12, 'Delantera', NULL, 1, 'Regina Herrera Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(118, 8, 'Melissa Jiménez Luna', 13, 'Medio', NULL, 1, 'Melissa Jiménez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(119, 8, 'Claudia Romero Castro', 14, 'Defensa', NULL, 1, 'Claudia Romero Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(120, 8, 'Natalia Sánchez Méndez', 15, 'Delantera', NULL, 1, 'Natalia Sánchez Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de REAL MADRID
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (10, 'capitana.realmadrid@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana REAL MADRID');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (9, 10, 'REAL MADRID', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de REAL MADRID (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(121, 9, 'Sofía Gallegos Hernández', 1, 'Portera', NULL, 1, 'Sofía Gallegos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(122, 9, 'Debora Gallegos Ruiz', 2, 'Defensa', NULL, 1, 'Debora Gallegos Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(123, 9, 'Valeria Martínez Cruz', 3, 'Defensa', NULL, 1, 'Valeria Martínez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(124, 9, 'Mariana López Vega', 4, 'Defensa', NULL, 1, 'Mariana López Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(125, 9, 'Fernanda Torres Silva', 5, 'Defensa', NULL, 1, 'Fernanda Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(126, 9, 'Daniela Castillo Ríos', 6, 'Medio', NULL, 1, 'Daniela Castillo Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(127, 9, 'Andrea Reyes Flores', 7, 'Medio', NULL, 1, 'Andrea Reyes Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(128, 9, 'Paola Navarro Díaz', 8, 'Medio', NULL, 1, 'Paola Navarro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(129, 9, 'Karla Jiménez Morales', 10, 'Medio', NULL, 1, 'Karla Jiménez Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(130, 9, 'Ximena Mendoza León', 9, 'Delantera', NULL, 1, 'Ximena Mendoza León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(131, 9, 'Regina Sánchez Ortiz', 11, 'Delantera', NULL, 1, 'Regina Sánchez Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(132, 9, 'Gabriela Herrera Luna', 12, 'Delantera', NULL, 1, 'Gabriela Herrera Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(133, 9, 'Melissa Ramírez Castro', 13, 'Medio', NULL, 1, 'Melissa Ramírez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(134, 9, 'Lucía Aguilar Pérez', 14, 'Defensa', NULL, 1, 'Lucía Aguilar Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(135, 9, 'Natalia Romero García', 15, 'Delantera', NULL, 1, 'Natalia Romero García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de FÉNIX F.C.
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (11, 'capitana.fenix@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana FÉNIX F.C.');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (10, 11, 'FÉNIX F.C.', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de FÉNIX F.C. (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(136, 10, 'Renata Flores Martínez', 1, 'Portera', NULL, 1, 'Renata Flores Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(137, 10, 'Alejandra Cruz López', 2, 'Defensa', NULL, 1, 'Alejandra Cruz López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(138, 10, 'Karina Ríos Hernández', 3, 'Defensa', NULL, 1, 'Karina Ríos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(139, 10, 'Daniela Vega Torres', 4, 'Defensa', NULL, 1, 'Daniela Vega Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(140, 10, 'Fernanda Silva Morales', 5, 'Defensa', NULL, 1, 'Fernanda Silva Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(141, 10, 'Valeria Ortiz Ramírez', 6, 'Medio', NULL, 1, 'Valeria Ortiz Ramírez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(142, 10, 'Mariana León García', 7, 'Medio', NULL, 1, 'Mariana León García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(143, 10, 'Andrea Luna Pérez', 8, 'Medio', NULL, 1, 'Andrea Luna Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(144, 10, 'Melissa Castro Jiménez', 10, 'Medio', NULL, 1, 'Melissa Castro Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(145, 10, 'Paola Díaz Romero', 9, 'Delantera', NULL, 1, 'Paola Díaz Romero', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(146, 10, 'Natalia Flores Sánchez', 11, 'Delantera', NULL, 1, 'Natalia Flores Sánchez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(147, 10, 'Jimena Herrera Mendoza', 12, 'Delantera', NULL, 1, 'Jimena Herrera Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(148, 10, 'Claudia Reyes Navarro', 13, 'Medio', NULL, 1, 'Claudia Reyes Navarro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(149, 10, 'Sofía Torres Aguilar', 14, 'Defensa', NULL, 1, 'Sofía Torres Aguilar', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(150, 10, 'Evelyn Martínez Ruiz', 15, 'Delantera', NULL, 1, 'Evelyn Martínez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);

-- Capitana de LOBAS MÉXICO
INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (12, 'capitana.lobas@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana LOBAS MÉXICO');
INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES (11, 12, 'LOBAS MÉXICO', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80', NULL);
-- Jugadoras de LOBAS MÉXICO (15 jugadoras)
INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES
(151, 11, 'Thalia Aguilera González', 1, 'Portera', NULL, 1, 'Thalia Aguilera González', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(152, 11, 'Olivia Pineda Martínez', 2, 'Defensa', NULL, 1, 'Olivia Pineda Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(153, 11, 'Britani García López', 3, 'Defensa', NULL, 1, 'Britani García López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(154, 11, 'Mariana Sánchez Cruz', 4, 'Defensa', NULL, 1, 'Mariana Sánchez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(155, 11, 'Fernanda Reyes Flores', 5, 'Defensa', NULL, 1, 'Fernanda Reyes Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(156, 11, 'Valeria Torres Mendoza', 6, 'Medio', NULL, 1, 'Valeria Torres Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(157, 11, 'Karla Jiménez Ruiz', 7, 'Medio', NULL, 1, 'Karla Jiménez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(158, 11, 'Andrea Ramírez Silva', 8, 'Medio', NULL, 1, 'Andrea Ramírez Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(159, 11, 'Daniela Navarro Ortiz', 10, 'Medio', NULL, 1, 'Daniela Navarro Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(160, 11, 'Regina Castillo Vega', 9, 'Delantera', NULL, 1, 'Regina Castillo Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(161, 11, 'Paola Herrera Díaz', 11, 'Delantera', NULL, 1, 'Paola Herrera Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(162, 11, 'Ximena Morales León', 12, 'Delantera', NULL, 1, 'Ximena Morales León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(163, 11, 'Gabriela Flores Ríos', 13, 'Medio', NULL, 1, 'Gabriela Flores Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(164, 11, 'Lucía Pérez Castro', 14, 'Defensa', NULL, 1, 'Lucía Pérez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1),
(165, 11, 'Natalia Romero Luna', 15, 'Delantera', NULL, 1, 'Natalia Romero Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1);
