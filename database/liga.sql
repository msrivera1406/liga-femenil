-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mi-db
-- Generation Time: Nov 15, 2026 at 07:42 PM
-- Server version: 13.0.2-MariaDB-ubu2604
-- PHP Version: 8.3.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `liga`
--

-- --------------------------------------------------------


--
-- Table structure for table `entrenadores`
--

CREATE TABLE `entrenadores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `disciplinas` varchar(150) NOT NULL,
  `zonas_cobertura` varchar(200) NOT NULL,
  `bio` text NOT NULL,
  `precio_sesion` decimal(8,2) NOT NULL,
  `telefono_publico` varchar(20) NOT NULL,
  `disponibilidad_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`disponibilidad_json`)),
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipos`
--

CREATE TABLE `equipos` (
  `id` int(11) NOT NULL,
  `capitana_id` int(11) DEFAULT NULL,
  `nombre` varchar(80) NOT NULL,
  `escudo_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipos`
--

INSERT INTO `equipos` (`id`, `capitana_id`, `nombre`, `escudo_url`, `video_url`, `creado_en`) VALUES
(1, 2, 'QUEER GOALS', '/images/Escudos/Queer_goals.jpeg', NULL, '2026-11-12 05:02:09'),
(2, 3, 'VALQUIRIAS', '/images/Escudos/Valquirias.jpeg', NULL, '2026-11-12 05:02:09'),
(3, 4, 'GOOD VIBES', '/images/Escudos/Good_vibes.jpeg', NULL, '2026-11-12 05:02:09'),
(4, 5, 'ALL STARS GV', '/images/Escudos/all_stars.jpeg', NULL, '2026-11-12 05:02:09'),
(5, 6, 'TBD UNITED', '/images/Escudos/TBD_united.jpeg', NULL, '2026-11-12 05:02:09'),
(6, 7, 'UNKNOWN', '/images/Escudos/unknown.jpeg', NULL, '2026-11-12 05:02:09'),
(7, 8, 'F.C. LIONESSES', '/images/Escudos/Lionesses.jpeg', NULL, '2026-11-12 05:02:09'),
(8, 9, 'BANDIDAS F.C.', '/images/Escudos/bandidas.jpeg', NULL, '2026-11-12 05:02:09'),
(9, 10, 'REAL MADRID', '/images/Escudos/real_madrid.jpeg', NULL, '2026-11-12 05:02:09'),
(10, 11, 'FÉNIX F.C.', '/images/Escudos/fenix.jpeg', NULL, '2026-11-12 05:02:09'),
(11, 12, 'LOBAS MÉXICO', '/images/Escudos/lobas.jpeg', NULL, '2026-11-12 05:02:09');

-- --------------------------------------------------------

--
-- Table structure for table `incidencias_partido`
--

CREATE TABLE `incidencias_partido` (
  `id` int(11) NOT NULL,
  `partido_id` int(11) NOT NULL,
  `jugadora_id` int(11) NOT NULL,
  `equipo_id` int(11) NOT NULL,
  `tipo` enum('gol','autogol','tarjeta_amarilla','tarjeta_roja','falta') NOT NULL,
  `minuto` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jornadas`
--

CREATE TABLE `jornadas` (
  `id` int(11) NOT NULL,
  `torneo_id` int(11) NOT NULL,
  `numero_jornada` tinyint(3) UNSIGNED NOT NULL,
  `fecha_domingo` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jugadoras`
--

CREATE TABLE `jugadoras` (
  `id` int(11) NOT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `nombre_deportivo` varchar(80) NOT NULL,
  `pronombres` varchar(30) DEFAULT 'Ella',
  `dorsal` tinyint(3) UNSIGNED DEFAULT NULL,
  `posicion` enum('Portera','Defensa','Medio','Delantera') NOT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `autoriza_imagen` tinyint(1) NOT NULL DEFAULT 0,
  `nombre_legal` varchar(120) NOT NULL,
  `telefono_contacto` varchar(20) NOT NULL,
  `contacto_emergencia_nombre` varchar(100) NOT NULL,
  `contacto_emergencia_telefono` varchar(20) NOT NULL,
  `aviso_privacidad_aceptado` tinyint(1) NOT NULL DEFAULT 1,
  `es_independiente` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jugadoras`
--

INSERT INTO `jugadoras` (`id`, `equipo_id`, `nombre_deportivo`, `pronombres`, `dorsal`, `posicion`, `foto_url`, `autoriza_imagen`, `nombre_legal`, `telefono_contacto`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`, `aviso_privacidad_aceptado`, `es_independiente`, `activo`, `creado_en`) VALUES
(1, 1, 'Mariana López Hernández', 'Ella', 1, 'Portera', '/images/jugadoras/queer-goals/jugadora_01.jpg', 1, 'Mariana López Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(2, 1, 'Daniela Ramírez Cruz', 'Ella', 2, 'Defensa', '/images/jugadoras/queer-goals/jugadora_02.jpg', 1, 'Daniela Ramírez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(3, 1, 'Fernanda Castillo Morales', 'Ella', 3, 'Defensa', '/images/jugadoras/queer-goals/jugadora_03.jpg', 1, 'Fernanda Castillo Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(4, 1, 'Andrea Sánchez Flores', 'Ella', 4, 'Defensa', '/images/jugadoras/queer-goals/jugadora_04.jpg', 1, 'Andrea Sánchez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(5, 1, 'Paola Jiménez Torres', 'Ella', 5, 'Defensa', '/images/jugadoras/queer-goals/jugadora_05.jpg', 1, 'Paola Jiménez Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(6, 1, 'Valeria Mendoza Ruiz', 'Ella', 6, 'Medio', '/images/jugadoras/queer-goals/jugadora_06.jpg', 1, 'Valeria Mendoza Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(7, 1, 'Karla Pérez García', 'Ella', 7, 'Medio', '/images/jugadoras/queer-goals/jugadora_07.jpg', 1, 'Karla Pérez García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(8, 1, 'Alejandra Reyes Luna', 'Ella', 8, 'Medio', '/images/jugadoras/queer-goals/jugadora_08.jpg', 1, 'Alejandra Reyes Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(9, 1, 'Gabriela Ortiz Vega', 'Ella', 10, 'Medio', '/images/jugadoras/queer-goals/jugadora_09.jpg', 1, 'Gabriela Ortiz Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(10, 1, 'Sofía Navarro Díaz', 'Ella', 9, 'Delantera', '/images/jugadoras/queer-goals/jugadora_10.jpg', 1, 'Sofía Navarro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(11, 1, 'Natalia Romero Silva', 'Ella', 11, 'Delantera', '/images/jugadoras/queer-goals/jugadora_11.jpg', 1, 'Natalia Romero Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(12, 1, 'Brenda Aguilar Ríos', 'Ella', 12, 'Delantera', '/images/jugadoras/queer-goals/jugadora_12.jpg', 1, 'Brenda Aguilar Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(13, 1, 'Ximena Flores Castro', 'Ella', 13, 'Medio', '/images/jugadoras/queer-goals/jugadora_13.jpg', 1, 'Ximena Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(14, 1, 'Melissa Vargas León', 'Ella', 14, 'Defensa', '/images/jugadoras/queer-goals/jugadora_14.jpg', 1, 'Melissa Vargas León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(15, 1, 'Regina Torres Méndez', 'Ella', 15, 'Delantera', '/images/jugadoras/queer-goals/jugadora_15.jpg', 1, 'Regina Torres Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(16, 2, 'Laura Martínez Silva', 'Ella', 1, 'Portera', '/images/jugadoras/valquirias/jugadora_01.jpg', 1, 'Laura Martínez Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(17, 2, 'Mónica Herrera López', 'Ella', 2, 'Defensa', '/images/jugadoras/valquirias/jugadora_02.jpg', 1, 'Mónica Herrera López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(18, 2, 'Itzel García Romero', 'Ella', 3, 'Defensa', '/images/jugadoras/valquirias/jugadora_03.jpg', 1, 'Itzel García Romero', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(19, 2, 'Claudia Sánchez Rivas', 'Ella', 4, 'Defensa', '/images/jugadoras/valquirias/jugadora_04.jpg', 1, 'Claudia Sánchez Rivas', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(20, 2, 'Jimena Morales Cruz', 'Ella', 5, 'Defensa', '/images/jugadoras/valquirias/jugadora_05.jpg', 1, 'Jimena Morales Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(21, 2, 'Diana Flores Mendoza', 'Ella', 6, 'Medio', '/images/jugadoras/valquirias/jugadora_06.jpg', 1, 'Diana Flores Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(22, 2, 'Renata Pérez Castillo', 'Ella', 7, 'Medio', '/images/jugadoras/valquirias/jugadora_07.jpg', 1, 'Renata Pérez Castillo', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(23, 2, 'Araceli Torres Jiménez', 'Ella', 8, 'Medio', '/images/jugadoras/valquirias/jugadora_08.jpg', 1, 'Araceli Torres Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(24, 2, 'Lucía Ramírez Vega', 'Ella', 10, 'Medio', '/images/jugadoras/valquirias/jugadora_09.jpg', 1, 'Lucía Ramírez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(25, 2, 'Evelyn Reyes Navarro', 'Ella', 9, 'Delantera', '/images/jugadoras/valquirias/jugadora_10.jpg', 1, 'Evelyn Reyes Navarro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(26, 2, 'Abril Castro Díaz', 'Ella', 11, 'Delantera', '/images/jugadoras/valquirias/jugadora_11.jpg', 1, 'Abril Castro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(27, 2, 'Karina León Aguilar', 'Ella', 12, 'Delantera', '/images/jugadoras/valquirias/jugadora_12.jpg', 1, 'Karina León Aguilar', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(28, 2, 'Fátima Ríos Hernández', 'Ella', 13, 'Medio', '/images/jugadoras/valquirias/jugadora_13.jpg', 1, 'Fátima Ríos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(29, 2, 'Verónica Luna Ortiz', 'Ella', 14, 'Defensa', '/images/jugadoras/valquirias/jugadora_14.jpg', 1, 'Verónica Luna Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(30, 2, 'Natalia Méndez Ruiz', 'Ella', 15, 'Delantera', '/images/jugadoras/valquirias/jugadora_15.jpg', 1, 'Natalia Méndez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(31, 3, 'Alejandra Sánchez López', 'Ella', 1, 'Portera', '/images/jugadoras/good-vibes/jugadora_01.jpg', 1, 'Alejandra Sánchez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(32, 3, 'Blanca Andrade Pérez', 'Ella', 2, 'Defensa', '/images/jugadoras/good-vibes/jugadora_02.jpg', 1, 'Blanca Andrade Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(33, 3, 'Carolina Jiménez Ríos', 'Ella', 3, 'Defensa', '/images/jugadoras/good-vibes/jugadora_03.jpg', 1, 'Carolina Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(34, 3, 'Jessica Morales Vega', 'Ella', 4, 'Defensa', '/images/jugadoras/good-vibes/jugadora_04.jpg', 1, 'Jessica Morales Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(35, 3, 'Paulina Castro Ruiz', 'Ella', 5, 'Defensa', '/images/jugadoras/good-vibes/jugadora_05.jpg', 1, 'Paulina Castro Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(36, 3, 'Mariana Torres Flores', 'Ella', 6, 'Medio', '/images/jugadoras/good-vibes/jugadora_06.jpg', 1, 'Mariana Torres Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(37, 3, 'Andrea Navarro Cruz', 'Ella', 7, 'Medio', '/images/jugadoras/good-vibes/jugadora_07.jpg', 1, 'Andrea Navarro Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(38, 3, 'Leslie Ramírez García', 'Ella', 8, 'Medio', '/images/jugadoras/good-vibes/jugadora_08.jpg', 1, 'Leslie Ramírez García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(39, 3, 'Gabriela Mendoza Silva', 'Ella', 10, 'Medio', '/images/jugadoras/good-vibes/jugadora_09.jpg', 1, 'Gabriela Mendoza Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(40, 3, 'Valentina Romero Díaz', 'Ella', 9, 'Delantera', '/images/jugadoras/good-vibes/jugadora_10.jpg', 1, 'Valentina Romero Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(41, 3, 'Michelle Reyes Hernández', 'Ella', 11, 'Delantera', '/images/jugadoras/good-vibes/jugadora_11.jpg', 1, 'Michelle Reyes Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(42, 3, 'Brenda Ortiz Luna', 'Ella', 12, 'Delantera', '/images/jugadoras/good-vibes/jugadora_12.jpg', 1, 'Brenda Ortiz Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(43, 3, 'Fernanda Aguilar León', 'Ella', 13, 'Medio', '/images/jugadoras/good-vibes/jugadora_13.jpg', 1, 'Fernanda Aguilar León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(44, 3, 'Sofía Herrera Méndez', 'Ella', 14, 'Defensa', '/images/jugadoras/good-vibes/jugadora_14.jpg', 1, 'Sofía Herrera Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(45, 3, 'Natalia Castillo Rivas', 'Ella', 15, 'Delantera', '/images/jugadoras/good-vibes/jugadora_15.jpg', 1, 'Natalia Castillo Rivas', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(46, 4, 'Daniela Flores Martínez', 'Ella', 1, 'Portera', '/images/jugadoras/all-stars-gv/jugadora_01.jpg', 1, 'Daniela Flores Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(47, 4, 'Paola Ramírez López', 'Ella', 2, 'Defensa', '/images/jugadoras/all-stars-gv/jugadora_02.jpg', 1, 'Paola Ramírez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(48, 4, 'Karla Mendoza Cruz', 'Ella', 3, 'Defensa', '/images/jugadoras/all-stars-gv/jugadora_03.jpg', 1, 'Karla Mendoza Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(49, 4, 'Ingrid Santana Moya', 'Ella', 4, 'Defensa', '/images/jugadoras/all-stars-gv/jugadora_04.jpg', 1, 'Ingrid Santana Moya', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(50, 4, 'Ximena Torres García', 'Ella', 5, 'Defensa', '/images/jugadoras/all-stars-gv/jugadora_05.jpg', 1, 'Ximena Torres García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(51, 4, 'Melissa Jiménez Ríos', 'Ella', 6, 'Medio', '/images/jugadoras/all-stars-gv/jugadora_06.jpg', 1, 'Melissa Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(52, 4, 'Mariana Reyes Silva', 'Ella', 7, 'Medio', '/images/jugadoras/all-stars-gv/jugadora_07.jpg', 1, 'Mariana Reyes Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(53, 4, 'Regina Navarro Pérez', 'Ella', 8, 'Medio', '/images/jugadoras/all-stars-gv/jugadora_08.jpg', 1, 'Regina Navarro Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(54, 4, 'Andrea Castillo Vega', 'Ella', 10, 'Medio', '/images/jugadoras/all-stars-gv/jugadora_09.jpg', 1, 'Andrea Castillo Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(55, 4, 'Valeria Ortiz Hernández', 'Ella', 9, 'Delantera', '/images/jugadoras/all-stars-gv/jugadora_10.jpg', 1, 'Valeria Ortiz Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(56, 4, 'Sofía León Morales', 'Ella', 11, 'Delantera', '/images/jugadoras/all-stars-gv/jugadora_11.jpg', 1, 'Sofía León Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(57, 4, 'Fernanda Aguilar Ruiz', 'Ella', 12, 'Delantera', '/images/jugadoras/all-stars-gv/jugadora_12.jpg', 1, 'Fernanda Aguilar Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(58, 4, 'Lucía Herrera Díaz', 'Ella', 13, 'Medio', '/images/jugadoras/all-stars-gv/jugadora_13.jpg', 1, 'Lucía Herrera Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(59, 4, 'Diana Romero Flores', 'Ella', 14, 'Defensa', '/images/jugadoras/all-stars-gv/jugadora_14.jpg', 1, 'Diana Romero Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(60, 4, 'Natalia Sánchez Luna', 'Ella', 15, 'Delantera', '/images/jugadoras/all-stars-gv/jugadora_15.jpg', 1, 'Natalia Sánchez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(61, 5, 'Gabriela Martínez Cruz', 'Ella', 1, 'Portera', '/images/jugadoras/tbd-united/jugadora_01.jpg', 1, 'Gabriela Martínez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(62, 5, 'Fernanda López Ríos', 'Ella', 2, 'Defensa', '/images/jugadoras/tbd-united/jugadora_02.jpg', 1, 'Fernanda López Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(63, 5, 'Alejandra Torres Silva', 'Ella', 3, 'Defensa', '/images/jugadoras/tbd-united/jugadora_03.jpg', 1, 'Alejandra Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(64, 5, 'Daniela Pérez Mendoza', 'Ella', 4, 'Defensa', '/images/jugadoras/tbd-united/jugadora_04.jpg', 1, 'Daniela Pérez Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(65, 5, 'Karina Romero Vega', 'Ella', 5, 'Defensa', '/images/jugadoras/tbd-united/jugadora_05.jpg', 1, 'Karina Romero Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(66, 5, 'Valeria Sánchez Ruiz', 'Ella', 6, 'Medio', '/images/jugadoras/tbd-united/jugadora_06.jpg', 1, 'Valeria Sánchez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(67, 5, 'Mónica Castillo Flores', 'Ella', 7, 'Medio', '/images/jugadoras/tbd-united/jugadora_07.jpg', 1, 'Mónica Castillo Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(68, 5, 'Itzel Navarro Hernández', 'Ella', 8, 'Medio', '/images/jugadoras/tbd-united/jugadora_08.jpg', 1, 'Itzel Navarro Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(69, 5, 'Paola Aguilar Díaz', 'Ella', 10, 'Medio', '/images/jugadoras/tbd-united/jugadora_09.jpg', 1, 'Paola Aguilar Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(70, 5, 'Regina Morales León', 'Ella', 9, 'Delantera', '/images/jugadoras/tbd-united/jugadora_10.jpg', 1, 'Regina Morales León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(71, 5, 'Jimena Reyes Ortiz', 'Ella', 11, 'Delantera', '/images/jugadoras/tbd-united/jugadora_11.jpg', 1, 'Jimena Reyes Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(72, 5, 'Andrea García Luna', 'Ella', 12, 'Delantera', '/images/jugadoras/tbd-united/jugadora_12.jpg', 1, 'Andrea García Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(73, 5, 'Laura Méndez Castro', 'Ella', 13, 'Medio', '/images/jugadoras/tbd-united/jugadora_13.jpg', 1, 'Laura Méndez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(74, 5, 'Evelyn Ríos Jiménez', 'Ella', 14, 'Defensa', '/images/jugadoras/tbd-united/jugadora_14.jpg', 1, 'Evelyn Ríos Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(75, 5, 'Ximena Herrera Ramírez', 'Ella', 15, 'Delantera', '/images/jugadoras/tbd-united/jugadora_15.jpg', 1, 'Ximena Herrera Ramírez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(76, 6, 'Claudia Ramírez Flores', 'Ella', 1, 'Portera', '/images/jugadoras/unknown/jugadora_01.jpg', 1, 'Claudia Ramírez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(77, 6, 'Natalia Pérez López', 'Ella', 2, 'Defensa', '/images/jugadoras/unknown/jugadora_02.jpg', 1, 'Natalia Pérez López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(78, 6, 'Melissa Torres Cruz', 'Ella', 3, 'Defensa', '/images/jugadoras/unknown/jugadora_03.jpg', 1, 'Melissa Torres Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(79, 6, 'Diana Sánchez Vega', 'Ella', 4, 'Defensa', '/images/jugadoras/unknown/jugadora_04.jpg', 1, 'Diana Sánchez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(80, 6, 'Abril Mendoza Ruiz', 'Ella', 5, 'Defensa', '/images/jugadoras/unknown/jugadora_05.jpg', 1, 'Abril Mendoza Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(81, 6, 'Valentina García Ríos', 'Ella', 6, 'Medio', '/images/jugadoras/unknown/jugadora_06.jpg', 1, 'Valentina García Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(82, 6, 'Jessica Navarro Silva', 'Ella', 7, 'Medio', '/images/jugadoras/unknown/jugadora_07.jpg', 1, 'Jessica Navarro Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(83, 6, 'Fátima Romero Díaz', 'Ella', 8, 'Medio', '/images/jugadoras/unknown/jugadora_08.jpg', 1, 'Fátima Romero Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(84, 6, 'Mariana Ortiz Hernández', 'Ella', 10, 'Medio', '/images/jugadoras/unknown/jugadora_09.jpg', 1, 'Mariana Ortiz Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(85, 6, 'Karla Castillo Morales', 'Ella', 9, 'Delantera', '/images/jugadoras/unknown/jugadora_10.jpg', 1, 'Karla Castillo Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(86, 6, 'Paola Herrera León', 'Ella', 11, 'Delantera', '/images/jugadoras/unknown/jugadora_11.jpg', 1, 'Paola Herrera León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(87, 6, 'Renata Aguilar Méndez', 'Ella', 12, 'Delantera', '/images/jugadoras/unknown/jugadora_12.jpg', 1, 'Renata Aguilar Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(88, 6, 'Sofía Jiménez Luna', 'Ella', 13, 'Medio', '/images/jugadoras/unknown/jugadora_13.jpg', 1, 'Sofía Jiménez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(89, 6, 'Andrea Flores Castro', 'Ella', 14, 'Defensa', '/images/jugadoras/unknown/jugadora_14.jpg', 1, 'Andrea Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(90, 6, 'Verónica Reyes Martínez', 'Ella', 15, 'Delantera', '/images/jugadoras/unknown/jugadora_15.jpg', 1, 'Verónica Reyes Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(91, 7, 'Jessica Aguilar Torres', 'Ella', 1, 'Portera', '/images/jugadoras/fc-lionesses/jugadora_01.jpg', 1, 'Jessica Aguilar Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(92, 7, 'Fernanda López García', 'Ella', 2, 'Defensa', '/images/jugadoras/fc-lionesses/jugadora_02.jpg', 1, 'Fernanda López García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(93, 7, 'Mariana Castillo Ruiz', 'Ella', 3, 'Defensa', '/images/jugadoras/fc-lionesses/jugadora_03.jpg', 1, 'Mariana Castillo Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(94, 7, 'Daniela Romero Cruz', 'Ella', 4, 'Defensa', '/images/jugadoras/fc-lionesses/jugadora_04.jpg', 1, 'Daniela Romero Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(95, 7, 'Karla Sánchez Vega', 'Ella', 5, 'Defensa', '/images/jugadoras/fc-lionesses/jugadora_05.jpg', 1, 'Karla Sánchez Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(96, 7, 'Valeria Martínez Flores', 'Ella', 6, 'Medio', '/images/jugadoras/fc-lionesses/jugadora_06.jpg', 1, 'Valeria Martínez Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(97, 7, 'Alejandra Mendoza Díaz', 'Ella', 7, 'Medio', '/images/jugadoras/fc-lionesses/jugadora_07.jpg', 1, 'Alejandra Mendoza Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(98, 7, 'Ximena Ramírez Ortiz', 'Ella', 8, 'Medio', '/images/jugadoras/fc-lionesses/jugadora_08.jpg', 1, 'Ximena Ramírez Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(99, 7, 'Natalia Herrera Silva', 'Ella', 10, 'Medio', '/images/jugadoras/fc-lionesses/jugadora_09.jpg', 1, 'Natalia Herrera Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(100, 7, 'Paola Reyes Luna', 'Ella', 9, 'Delantera', '/images/jugadoras/fc-lionesses/jugadora_10.jpg', 1, 'Paola Reyes Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(101, 7, 'Regina Jiménez Ríos', 'Ella', 11, 'Delantera', '/images/jugadoras/fc-lionesses/jugadora_11.jpg', 1, 'Regina Jiménez Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(102, 7, 'Gabriela Navarro León', 'Ella', 12, 'Delantera', '/images/jugadoras/fc-lionesses/jugadora_12.jpg', 1, 'Gabriela Navarro León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(103, 7, 'Lucía Pérez Morales', 'Ella', 13, 'Medio', '/images/jugadoras/fc-lionesses/jugadora_13.jpg', 1, 'Lucía Pérez Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(104, 7, 'Evelyn Torres Hernández', 'Ella', 14, 'Defensa', '/images/jugadoras/fc-lionesses/jugadora_14.jpg', 1, 'Evelyn Torres Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(105, 7, 'Mónica Flores Castro', 'Ella', 15, 'Delantera', '/images/jugadoras/fc-lionesses/jugadora_15.jpg', 1, 'Mónica Flores Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(106, 8, 'Andrea Morales Ríos', 'Ella', 1, 'Portera', '/images/jugadoras/bandidas-fc/jugadora_01.jpg', 1, 'Andrea Morales Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(107, 8, 'Esmeralda Sosa Martínez', 'Ella', 2, 'Defensa', '/images/jugadoras/bandidas-fc/jugadora_02.jpg', 1, 'Esmeralda Sosa Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(108, 8, 'Paulina García López', 'Ella', 3, 'Defensa', '/images/jugadoras/bandidas-fc/jugadora_03.jpg', 1, 'Paulina García López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(109, 8, 'Diana Reyes Cruz', 'Ella', 4, 'Defensa', '/images/jugadoras/bandidas-fc/jugadora_04.jpg', 1, 'Diana Reyes Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(110, 8, 'Jimena Navarro Vega', 'Ella', 5, 'Defensa', '/images/jugadoras/bandidas-fc/jugadora_05.jpg', 1, 'Jimena Navarro Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(111, 8, 'Karina Torres Silva', 'Ella', 6, 'Medio', '/images/jugadoras/bandidas-fc/jugadora_06.jpg', 1, 'Karina Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(112, 8, 'Fernanda Castillo Ruiz', 'Ella', 7, 'Medio', '/images/jugadoras/bandidas-fc/jugadora_07.jpg', 1, 'Fernanda Castillo Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(113, 8, 'Valeria Mendoza Flores', 'Ella', 8, 'Medio', '/images/jugadoras/bandidas-fc/jugadora_08.jpg', 1, 'Valeria Mendoza Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(114, 8, 'Brenda Ramírez Díaz', 'Ella', 10, 'Medio', '/images/jugadoras/bandidas-fc/jugadora_09.jpg', 1, 'Brenda Ramírez Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(115, 8, 'Sofía Aguilar Hernández', 'Ella', 9, 'Delantera', '/images/jugadoras/bandidas-fc/jugadora_10.jpg', 1, 'Sofía Aguilar Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(116, 8, 'Mariana Pérez León', 'Ella', 11, 'Delantera', '/images/jugadoras/bandidas-fc/jugadora_11.jpg', 1, 'Mariana Pérez León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(117, 8, 'Regina Herrera Ortiz', 'Ella', 12, 'Delantera', '/images/jugadoras/bandidas-fc/jugadora_12.jpg', 1, 'Regina Herrera Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(118, 8, 'Melissa Jiménez Luna', 'Ella', 13, 'Medio', '/images/jugadoras/bandidas-fc/jugadora_13.jpg', 1, 'Melissa Jiménez Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(119, 8, 'Claudia Romero Castro', 'Ella', 14, 'Defensa', '/images/jugadoras/bandidas-fc/jugadora_14.jpg', 1, 'Claudia Romero Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(120, 8, 'Natalia Sánchez Méndez', 'Ella', 15, 'Delantera', '/images/jugadoras/bandidas-fc/jugadora_15.jpg', 1, 'Natalia Sánchez Méndez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(121, 9, 'Sofía Gallegos Hernández', 'Ella', 1, 'Portera', '/images/jugadoras/real-madrid/jugadora_01.jpg', 1, 'Sofía Gallegos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(122, 9, 'Debora Gallegos Ruiz', 'Ella', 2, 'Defensa', '/images/jugadoras/real-madrid/jugadora_02.jpg', 1, 'Debora Gallegos Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(123, 9, 'Valeria Martínez Cruz', 'Ella', 3, 'Defensa', '/images/jugadoras/real-madrid/jugadora_03.jpg', 1, 'Valeria Martínez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(124, 9, 'Mariana López Vega', 'Ella', 4, 'Defensa', '/images/jugadoras/real-madrid/jugadora_04.jpg', 1, 'Mariana López Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(125, 9, 'Fernanda Torres Silva', 'Ella', 5, 'Defensa', '/images/jugadoras/real-madrid/jugadora_05.jpg', 1, 'Fernanda Torres Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(126, 9, 'Daniela Castillo Ríos', 'Ella', 6, 'Medio', '/images/jugadoras/real-madrid/jugadora_06.jpg', 1, 'Daniela Castillo Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(127, 9, 'Andrea Reyes Flores', 'Ella', 7, 'Medio', '/images/jugadoras/real-madrid/jugadora_07.jpg', 1, 'Andrea Reyes Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(128, 9, 'Paola Navarro Díaz', 'Ella', 8, 'Medio', '/images/jugadoras/real-madrid/jugadora_08.jpg', 1, 'Paola Navarro Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(129, 9, 'Karla Jiménez Morales', 'Ella', 10, 'Medio', '/images/jugadoras/real-madrid/jugadora_09.jpg', 1, 'Karla Jiménez Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(130, 9, 'Ximena Mendoza León', 'Ella', 9, 'Delantera', '/images/jugadoras/real-madrid/jugadora_10.jpg', 1, 'Ximena Mendoza León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(131, 9, 'Regina Sánchez Ortiz', 'Ella', 11, 'Delantera', '/images/jugadoras/real-madrid/jugadora_11.jpg', 1, 'Regina Sánchez Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(132, 9, 'Gabriela Herrera Luna', 'Ella', 12, 'Delantera', '/images/jugadoras/real-madrid/jugadora_12.jpg', 1, 'Gabriela Herrera Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(133, 9, 'Melissa Ramírez Castro', 'Ella', 13, 'Medio', '/images/jugadoras/real-madrid/jugadora_13.jpg', 1, 'Melissa Ramírez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(134, 9, 'Lucía Aguilar Pérez', 'Ella', 14, 'Defensa', '/images/jugadoras/real-madrid/jugadora_14.jpg', 1, 'Lucía Aguilar Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(135, 9, 'Natalia Romero García', 'Ella', 15, 'Delantera', '/images/jugadoras/real-madrid/jugadora_15.jpg', 1, 'Natalia Romero García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(136, 10, 'Renata Flores Martínez', 'Ella', 1, 'Portera', '/images/jugadoras/fenix-fc/jugadora_01.jpg', 1, 'Renata Flores Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(137, 10, 'Alejandra Cruz López', 'Ella', 2, 'Defensa', '/images/jugadoras/fenix-fc/jugadora_02.jpg', 1, 'Alejandra Cruz López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(138, 10, 'Karina Ríos Hernández', 'Ella', 3, 'Defensa', '/images/jugadoras/fenix-fc/jugadora_03.jpg', 1, 'Karina Ríos Hernández', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(139, 10, 'Daniela Vega Torres', 'Ella', 4, 'Defensa', '/images/jugadoras/fenix-fc/jugadora_04.jpg', 1, 'Daniela Vega Torres', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(140, 10, 'Fernanda Silva Morales', 'Ella', 5, 'Defensa', '/images/jugadoras/fenix-fc/jugadora_05.jpg', 1, 'Fernanda Silva Morales', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(141, 10, 'Valeria Ortiz Ramírez', 'Ella', 6, 'Medio', '/images/jugadoras/fenix-fc/jugadora_06.jpg', 1, 'Valeria Ortiz Ramírez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(142, 10, 'Mariana León García', 'Ella', 7, 'Medio', '/images/jugadoras/fenix-fc/jugadora_07.jpg', 1, 'Mariana León García', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(143, 10, 'Andrea Luna Pérez', 'Ella', 8, 'Medio', '/images/jugadoras/fenix-fc/jugadora_08.jpg', 1, 'Andrea Luna Pérez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(144, 10, 'Melissa Castro Jiménez', 'Ella', 10, 'Medio', '/images/jugadoras/fenix-fc/jugadora_09.jpg', 1, 'Melissa Castro Jiménez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(145, 10, 'Paola Díaz Romero', 'Ella', 9, 'Delantera', '/images/jugadoras/fenix-fc/jugadora_10.jpg', 1, 'Paola Díaz Romero', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(146, 10, 'Natalia Flores Sánchez', 'Ella', 11, 'Delantera', '/images/jugadoras/fenix-fc/jugadora_11.jpg', 1, 'Natalia Flores Sánchez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(147, 10, 'Jimena Herrera Mendoza', 'Ella', 12, 'Delantera', '/images/jugadoras/fenix-fc/jugadora_12.jpg', 1, 'Jimena Herrera Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(148, 10, 'Claudia Reyes Navarro', 'Ella', 13, 'Medio', '/images/jugadoras/fenix-fc/jugadora_13.jpg', 1, 'Claudia Reyes Navarro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(149, 10, 'Sofía Torres Aguilar', 'Ella', 14, 'Defensa', '/images/jugadoras/fenix-fc/jugadora_14.jpg', 1, 'Sofía Torres Aguilar', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(150, 10, 'Evelyn Martínez Ruiz', 'Ella', 15, 'Delantera', '/images/jugadoras/fenix-fc/jugadora_15.jpg', 1, 'Evelyn Martínez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(151, 11, 'Thalia Aguilera González', 'Ella', 1, 'Portera', '/images/jugadoras/lobas-mexico/jugadora_01.jpg', 1, 'Thalia Aguilera González', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(152, 11, 'Olivia Pineda Martínez', 'Ella', 2, 'Defensa', '/images/jugadoras/lobas-mexico/jugadora_02.jpg', 1, 'Olivia Pineda Martínez', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(153, 11, 'Britani García López', 'Ella', 3, 'Defensa', '/images/jugadoras/lobas-mexico/jugadora_03.jpg', 1, 'Britani García López', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(154, 11, 'Mariana Sánchez Cruz', 'Ella', 4, 'Defensa', '/images/jugadoras/lobas-mexico/jugadora_04.jpg', 1, 'Mariana Sánchez Cruz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(155, 11, 'Fernanda Reyes Flores', 'Ella', 5, 'Defensa', '/images/jugadoras/lobas-mexico/jugadora_05.jpg', 1, 'Fernanda Reyes Flores', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(156, 11, 'Valeria Torres Mendoza', 'Ella', 6, 'Medio', '/images/jugadoras/lobas-mexico/jugadora_06.jpg', 1, 'Valeria Torres Mendoza', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(157, 11, 'Karla Jiménez Ruiz', 'Ella', 7, 'Medio', '/images/jugadoras/lobas-mexico/jugadora_07.jpg', 1, 'Karla Jiménez Ruiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(158, 11, 'Andrea Ramírez Silva', 'Ella', 8, 'Medio', '/images/jugadoras/lobas-mexico/jugadora_08.jpg', 1, 'Andrea Ramírez Silva', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(159, 11, 'Daniela Navarro Ortiz', 'Ella', 10, 'Medio', '/images/jugadoras/lobas-mexico/jugadora_09.jpg', 1, 'Daniela Navarro Ortiz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(160, 11, 'Regina Castillo Vega', 'Ella', 9, 'Delantera', '/images/jugadoras/lobas-mexico/jugadora_10.jpg', 1, 'Regina Castillo Vega', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(161, 11, 'Paola Herrera Díaz', 'Ella', 11, 'Delantera', '/images/jugadoras/lobas-mexico/jugadora_11.jpg', 1, 'Paola Herrera Díaz', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(162, 11, 'Ximena Morales León', 'Ella', 12, 'Delantera', '/images/jugadoras/lobas-mexico/jugadora_12.jpg', 1, 'Ximena Morales León', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(163, 11, 'Gabriela Flores Ríos', 'Ella', 13, 'Medio', '/images/jugadoras/lobas-mexico/jugadora_13.jpg', 1, 'Gabriela Flores Ríos', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(164, 11, 'Lucía Pérez Castro', 'Ella', 14, 'Defensa', '/images/jugadoras/lobas-mexico/jugadora_14.jpg', 1, 'Lucía Pérez Castro', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09'),
(165, 11, 'Natalia Romero Luna', 'Ella', 15, 'Delantera', '/images/jugadoras/lobas-mexico/jugadora_15.jpg', 1, 'Natalia Romero Luna', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1, '2026-11-12 05:02:09');

-- --------------------------------------------------------

--
-- Table structure for table `partidos`
--

CREATE TABLE `partidos` (
  `id` int(11) NOT NULL,
  `jornada_id` int(11) NOT NULL,
  `equipo_local_id` int(11) NOT NULL,
  `equipo_visitante_id` int(11) NOT NULL,
  `horario` time NOT NULL,
  `goles_local` tinyint(3) UNSIGNED DEFAULT 0,
  `goles_visitante` tinyint(3) UNSIGNED DEFAULT 0,
  `empate_minuto_18` tinyint(1) DEFAULT 0,
  `penales_local` tinyint(3) UNSIGNED DEFAULT NULL,
  `penales_visitante` tinyint(3) UNSIGNED DEFAULT NULL,
  `ganador_id` int(11) DEFAULT NULL,
  `estado` enum('programado','en_juego','finalizado','suspendido') NOT NULL DEFAULT 'programado',
  `cancha` varchar(50) DEFAULT 'Cancha 1',
  `notas_mesa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `torneos`
--

CREATE TABLE `torneos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `torneos`
--

INSERT INTO `torneos` (`id`, `nombre`, `fecha_inicio`, `activo`) VALUES
(1, '4.ª Edición - Liga de Fútbol Mujeres Diversas México', '2026-11-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('superadmin','capitana','entrenador') NOT NULL DEFAULT 'capitana',
  `nombre_contacto` varchar(100) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `rol`, `nombre_contacto`, `creado_en`) VALUES
(1, 'admin@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'superadmin', 'Directora de Liga', '2026-11-12 05:02:09'),
(2, 'capitana.queergoals@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana QUEER GOALS', '2026-11-12 05:02:09'),
(3, 'capitana.valquirias@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana VALQUIRIAS', '2026-11-12 05:02:09'),
(4, 'capitana.goodvibes@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana GOOD VIBES', '2026-11-12 05:02:09'),
(5, 'capitana.allstars@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana ALL STARS GV', '2026-11-12 05:02:09'),
(6, 'capitana.tbd@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana TBD UNITED', '2026-11-12 05:02:09'),
(7, 'capitana.unknown@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana UNKNOWN', '2026-11-12 05:02:09'),
(8, 'capitana.lionesses@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana F.C. LIONESSES', '2026-11-12 05:02:09'),
(9, 'capitana.bandidas@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana BANDIDAS F.C.', '2026-11-12 05:02:09'),
(10, 'capitana.realmadrid@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana REAL MADRID', '2026-11-12 05:02:09'),
(11, 'capitana.fenix@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana FÉNIX F.C.', '2026-11-12 05:02:09'),
(12, 'capitana.lobas@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana LOBAS MÉXICO', '2026-11-12 05:02:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `entrenadores`
--
ALTER TABLE `entrenadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`);

--
-- Indexes for table `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `fk_equipo_capitana` (`capitana_id`);

--
-- Indexes for table `incidencias_partido`
--
ALTER TABLE `incidencias_partido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_incidencia_partido` (`partido_id`),
  ADD KEY `fk_incidencia_jugadora` (`jugadora_id`),
  ADD KEY `fk_incidencia_equipo` (`equipo_id`);

--
-- Indexes for table `jornadas`
--
ALTER TABLE `jornadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_jornada_torneo` (`torneo_id`);

--
-- Indexes for table `jugadoras`
--
ALTER TABLE `jugadoras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_jugadora_equipo` (`equipo_id`);

--
-- Indexes for table `partidos`
--
ALTER TABLE `partidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_partido_jornada` (`jornada_id`),
  ADD KEY `fk_partido_local` (`equipo_local_id`),
  ADD KEY `fk_partido_visitante` (`equipo_visitante_id`),
  ADD KEY `fk_partido_ganador` (`ganador_id`);

--
-- Indexes for table `torneos`
--
ALTER TABLE `torneos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `entrenadores`
--
ALTER TABLE `entrenadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipos`
--
ALTER TABLE `equipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `incidencias_partido`
--
ALTER TABLE `incidencias_partido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jornadas`
--
ALTER TABLE `jornadas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jugadoras`
--
ALTER TABLE `jugadoras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `partidos`
--
ALTER TABLE `partidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `torneos`
--
ALTER TABLE `torneos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `entrenadores`
--
ALTER TABLE `entrenadores`
  ADD CONSTRAINT `fk_entrenador_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `equipos`
--
ALTER TABLE `equipos`
  ADD CONSTRAINT `fk_equipo_capitana` FOREIGN KEY (`capitana_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `incidencias_partido`
--
ALTER TABLE `incidencias_partido`
  ADD CONSTRAINT `fk_incidencia_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_incidencia_jugadora` FOREIGN KEY (`jugadora_id`) REFERENCES `jugadoras` (`id`),
  ADD CONSTRAINT `fk_incidencia_partido` FOREIGN KEY (`partido_id`) REFERENCES `partidos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jornadas`
--
ALTER TABLE `jornadas`
  ADD CONSTRAINT `fk_jornada_torneo` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jugadoras`
--
ALTER TABLE `jugadoras`
  ADD CONSTRAINT `fk_jugadora_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `partidos`
--
ALTER TABLE `partidos`
  ADD CONSTRAINT `fk_partido_ganador` FOREIGN KEY (`ganador_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_partido_jornada` FOREIGN KEY (`jornada_id`) REFERENCES `jornadas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_partido_local` FOREIGN KEY (`equipo_local_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_partido_visitante` FOREIGN KEY (`equipo_visitante_id`) REFERENCES `equipos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------

--
-- Vista: tabla de posiciones (solo equipos activos). Uso: SELECT * FROM vista_posiciones;
--

CREATE OR REPLACE VIEW vista_posiciones AS
SELECT
    ROW_NUMBER() OVER (
        ORDER BY base.Pts DESC, base.DG DESC, base.GF DESC, base.equipo ASC
    ) AS pos,
    base.*
FROM (
    SELECT
        e.id         AS equipo_id,
        e.nombre     AS equipo,
        e.escudo_url AS escudo_url,

        (SELECT COUNT(*) FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)) AS PJ,

        (SELECT COUNT(*) FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND pa.ganador_id = e.id) AS PG,

        (SELECT COUNT(*) FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)
           AND pa.ganador_id IS NULL) AS PE,

        (SELECT COUNT(*) FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)
           AND pa.ganador_id IS NOT NULL AND pa.ganador_id <> e.id) AS PP,

        (SELECT COALESCE(SUM(CASE WHEN pa.equipo_local_id = e.id THEN pa.goles_local ELSE pa.goles_visitante END), 0)
         FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)) AS GF,

        (SELECT COALESCE(SUM(CASE WHEN pa.equipo_local_id = e.id THEN pa.goles_visitante ELSE pa.goles_local END), 0)
         FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)) AS GC,

        (SELECT COALESCE(SUM(CASE WHEN pa.equipo_local_id = e.id THEN pa.goles_local ELSE pa.goles_visitante END)
                       - SUM(CASE WHEN pa.equipo_local_id = e.id THEN pa.goles_visitante ELSE pa.goles_local END), 0)
         FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)) AS DG,

        (SELECT COUNT(*) * 3 FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND pa.ganador_id = e.id) AS Pts
    FROM equipos e
    WHERE e.activo = 1
) base
ORDER BY base.Pts DESC, base.DG DESC, base.GF DESC, base.equipo ASC;

-- --------------------------------------------------------

--
-- Vista: porteria / valla invicta (solo equipos activos). Uso: SELECT * FROM vista_porteria;
--

CREATE OR REPLACE VIEW vista_porteria AS
SELECT
    e.id         AS equipo_id,
    e.nombre     AS equipo,
    e.escudo_url AS escudo_url,

    (SELECT COUNT(*) FROM partidos pa
     WHERE pa.estado = 'finalizado'
       AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)) AS PJ,

    (SELECT COUNT(*) FROM partidos pa
     WHERE pa.estado = 'finalizado'
       AND ((pa.equipo_local_id = e.id AND pa.goles_visitante = 0)
         OR (pa.equipo_visitante_id = e.id AND pa.goles_local = 0))) AS vallas_invictas,

    COALESCE(ROUND(
        (SELECT COUNT(*) FROM partidos pa
         WHERE pa.estado = 'finalizado'
           AND ((pa.equipo_local_id = e.id AND pa.goles_visitante = 0)
             OR (pa.equipo_visitante_id = e.id AND pa.goles_local = 0)))
        /
        NULLIF((SELECT COUNT(*) FROM partidos pa
                WHERE pa.estado = 'finalizado'
                  AND (pa.equipo_local_id = e.id OR pa.equipo_visitante_id = e.id)), 0)
    , 3), 0) AS promedio
FROM equipos e
WHERE e.activo = 1
ORDER BY vallas_invictas DESC, e.nombre ASC;