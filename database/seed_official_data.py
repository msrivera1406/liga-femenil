import os
import subprocess
import json
import hashlib

# 11 Equipos oficiales con sus 15 jugadoras extraídas fielmente del padrón de la 4.ª Edición
OFFICIAL_TEAMS_DATA = [
    {
        "id": 1,
        "slug": "queer-goals",
        "email_capitana": "capitana.queergoals@ligafemenil.mx",
        "nombre": "QUEER GOALS",
        "escudo_url": "/images/Escudos/Queer_goals.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Mariana López Hernández", "edad": 26, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Daniela Ramírez Cruz", "edad": 24, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Fernanda Castillo Morales", "edad": 29, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Andrea Sánchez Flores", "edad": 22, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Paola Jiménez Torres", "edad": 31, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valeria Mendoza Ruiz", "edad": 25, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Karla Pérez García", "edad": 28, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Alejandra Reyes Luna", "edad": 23, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Gabriela Ortiz Vega", "edad": 30, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Sofía Navarro Díaz", "edad": 21, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Natalia Romero Silva", "edad": 27, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Brenda Aguilar Ríos", "edad": 32, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Ximena Flores Castro", "edad": 20, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Melissa Vargas León", "edad": 34, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Regina Torres Méndez", "edad": 26, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 2,
        "slug": "valquirias",
        "email_capitana": "capitana.valquirias@ligafemenil.mx",
        "nombre": "VALQUIRIAS",
        "escudo_url": "/images/Escudos/Valquirias.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Laura Martínez Silva", "edad": 28, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Mónica Herrera López", "edad": 32, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Itzel García Romero", "edad": 24, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Claudia Sánchez Rivas", "edad": 35, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Jimena Morales Cruz", "edad": 22, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Diana Flores Mendoza", "edad": 27, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Renata Pérez Castillo", "edad": 21, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Araceli Torres Jiménez", "edad": 30, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Lucía Ramírez Vega", "edad": 25, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Evelyn Reyes Navarro", "edad": 29, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Abril Castro Díaz", "edad": 23, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Karina León Aguilar", "edad": 33, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Fátima Ríos Hernández", "edad": 20, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Verónica Luna Ortiz", "edad": 37, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Méndez Ruiz", "edad": 26, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 3,
        "slug": "good-vibes",
        "email_capitana": "capitana.goodvibes@ligafemenil.mx",
        "nombre": "GOOD VIBES",
        "escudo_url": "/images/Escudos/Good_vibes.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Alejandra Sánchez López", "edad": 27, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Blanca Andrade Pérez", "edad": 31, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Carolina Jiménez Ríos", "edad": 24, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Jessica Morales Vega", "edad": 29, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Paulina Castro Ruiz", "edad": 22, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Mariana Torres Flores", "edad": 26, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Andrea Navarro Cruz", "edad": 30, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Leslie Ramírez García", "edad": 23, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Gabriela Mendoza Silva", "edad": 34, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Valentina Romero Díaz", "edad": 21, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Michelle Reyes Hernández", "edad": 28, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Brenda Ortiz Luna", "edad": 32, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Fernanda Aguilar León", "edad": 25, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Sofía Herrera Méndez", "edad": 20, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Castillo Rivas", "edad": 27, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 4,
        "slug": "all-stars-gv",
        "email_capitana": "capitana.allstars@ligafemenil.mx",
        "nombre": "ALL STARS GV",
        "escudo_url": "/images/Escudos/all_stars.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Daniela Flores Martínez", "edad": 25, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Paola Ramírez López", "edad": 29, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Karla Mendoza Cruz", "edad": 33, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Ingrid Santana Moya", "edad": 27, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Ximena Torres García", "edad": 22, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Melissa Jiménez Ríos", "edad": 30, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Mariana Reyes Silva", "edad": 24, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Regina Navarro Pérez", "edad": 21, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Andrea Castillo Vega", "edad": 28, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Valeria Ortiz Hernández", "edad": 26, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Sofía León Morales", "edad": 23, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Fernanda Aguilar Ruiz", "edad": 32, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Lucía Herrera Díaz", "edad": 20, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Diana Romero Flores", "edad": 35, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Sánchez Luna", "edad": 27, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 5,
        "slug": "tbd-united",
        "email_capitana": "capitana.tbd@ligafemenil.mx",
        "nombre": "TBD UNITED",
        "escudo_url": "/images/Escudos/TBD_united.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Gabriela Martínez Cruz", "edad": 30, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Fernanda López Ríos", "edad": 24, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Alejandra Torres Silva", "edad": 28, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Daniela Pérez Mendoza", "edad": 22, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Karina Romero Vega", "edad": 34, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valeria Sánchez Ruiz", "edad": 26, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Mónica Castillo Flores", "edad": 31, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Itzel Navarro Hernández", "edad": 23, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Paola Aguilar Díaz", "edad": 29, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Regina Morales León", "edad": 21, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Jimena Reyes Ortiz", "edad": 25, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Andrea García Luna", "edad": 33, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Laura Méndez Castro", "edad": 27, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Evelyn Ríos Jiménez", "edad": 36, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Ximena Herrera Ramírez", "edad": 20, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 6,
        "slug": "unknown",
        "email_capitana": "capitana.unknown@ligafemenil.mx",
        "nombre": "UNKNOWN",
        "escudo_url": "/images/Escudos/unknown.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Claudia Ramírez Flores", "edad": 32, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Natalia Pérez López", "edad": 24, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Melissa Torres Cruz", "edad": 27, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Diana Sánchez Vega", "edad": 35, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Abril Mendoza Ruiz", "edad": 22, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valentina García Ríos", "edad": 26, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Jessica Navarro Silva", "edad": 29, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Fátima Romero Díaz", "edad": 21, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Mariana Ortiz Hernández", "edad": 30, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Karla Castillo Morales", "edad": 25, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Paola Herrera León", "edad": 28, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Renata Aguilar Méndez", "edad": 23, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Sofía Jiménez Luna", "edad": 20, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Andrea Flores Castro", "edad": 34, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Verónica Reyes Martínez", "edad": 37, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 7,
        "slug": "fc-lionesses",
        "email_capitana": "capitana.lionesses@ligafemenil.mx",
        "nombre": "F.C. LIONESSES",
        "escudo_url": "/images/Escudos/Lionesses.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Jessica Aguilar Torres", "edad": 29, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Fernanda López García", "edad": 25, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Mariana Castillo Ruiz", "edad": 31, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Daniela Romero Cruz", "edad": 22, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Karla Sánchez Vega", "edad": 27, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valeria Martínez Flores", "edad": 24, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Alejandra Mendoza Díaz", "edad": 33, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Ximena Ramírez Ortiz", "edad": 21, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Natalia Herrera Silva", "edad": 28, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Paola Reyes Luna", "edad": 26, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Regina Jiménez Ríos", "edad": 23, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Gabriela Navarro León", "edad": 35, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Lucía Pérez Morales", "edad": 20, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Evelyn Torres Hernández", "edad": 30, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Mónica Flores Castro", "edad": 32, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 8,
        "slug": "bandidas-fc",
        "email_capitana": "capitana.bandidas@ligafemenil.mx",
        "nombre": "BANDIDAS F.C.",
        "escudo_url": "/images/Escudos/bandidas.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Andrea Morales Ríos", "edad": 28, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Esmeralda Sosa Martínez", "edad": 30, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Paulina García López", "edad": 24, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Diana Reyes Cruz", "edad": 33, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Jimena Navarro Vega", "edad": 21, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Karina Torres Silva", "edad": 27, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Fernanda Castillo Ruiz", "edad": 25, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Valeria Mendoza Flores", "edad": 29, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Brenda Ramírez Díaz", "edad": 34, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Sofía Aguilar Hernández", "edad": 22, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Mariana Pérez León", "edad": 26, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Regina Herrera Ortiz", "edad": 23, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Melissa Jiménez Luna", "edad": 31, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Claudia Romero Castro", "edad": 36, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Sánchez Méndez", "edad": 20, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 9,
        "slug": "real-madrid",
        "email_capitana": "capitana.realmadrid@ligafemenil.mx",
        "nombre": "REAL MADRID",
        "escudo_url": "/images/Escudos/real_madrid.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Sofía Gallegos Hernández", "edad": 27, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Debora Gallegos Ruiz", "edad": 29, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Valeria Martínez Cruz", "edad": 24, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Mariana López Vega", "edad": 32, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Fernanda Torres Silva", "edad": 25, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Daniela Castillo Ríos", "edad": 23, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Andrea Reyes Flores", "edad": 28, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Paola Navarro Díaz", "edad": 30, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Karla Jiménez Morales", "edad": 26, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Ximena Mendoza León", "edad": 21, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Regina Sánchez Ortiz", "edad": 22, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Gabriela Herrera Luna", "edad": 34, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Melissa Ramírez Castro", "edad": 31, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Lucía Aguilar Pérez", "edad": 20, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Romero García", "edad": 27, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 10,
        "slug": "fenix-fc",
        "email_capitana": "capitana.fenix@ligafemenil.mx",
        "nombre": "FÉNIX F.C.",
        "escudo_url": "/images/Escudos/fenix.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Renata Flores Martínez", "edad": 24, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Alejandra Cruz López", "edad": 28, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Karina Ríos Hernández", "edad": 33, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Daniela Vega Torres", "edad": 22, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Fernanda Silva Morales", "edad": 27, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valeria Ortiz Ramírez", "edad": 25, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Mariana León García", "edad": 30, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Andrea Luna Pérez", "edad": 23, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Melissa Castro Jiménez", "edad": 29, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Paola Díaz Romero", "edad": 26, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Natalia Flores Sánchez", "edad": 21, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Jimena Herrera Mendoza", "edad": 32, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Claudia Reyes Navarro", "edad": 35, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Sofía Torres Aguilar", "edad": 20, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Evelyn Martínez Ruiz", "edad": 31, "posicion": "Delantera", "dorsal": 15}
        ]
    },
    {
        "id": 11,
        "slug": "lobas-mexico",
        "email_capitana": "capitana.lobas@ligafemenil.mx",
        "nombre": "LOBAS MÉXICO",
        "escudo_url": "/images/Escudos/lobas.jpeg",
        "jugadoras": [
            {"num": 1, "nombre": "Thalia Aguilera González", "edad": 28, "posicion": "Portera", "dorsal": 1},
            {"num": 2, "nombre": "Olivia Pineda Martínez", "edad": 25, "posicion": "Defensa", "dorsal": 2},
            {"num": 3, "nombre": "Britani García López", "edad": 27, "posicion": "Defensa", "dorsal": 3},
            {"num": 4, "nombre": "Mariana Sánchez Cruz", "edad": 23, "posicion": "Defensa", "dorsal": 4},
            {"num": 5, "nombre": "Fernanda Reyes Flores", "edad": 31, "posicion": "Defensa", "dorsal": 5},
            {"num": 6, "nombre": "Valeria Torres Mendoza", "edad": 24, "posicion": "Medio", "dorsal": 6},
            {"num": 7, "nombre": "Karla Jiménez Ruiz", "edad": 29, "posicion": "Medio", "dorsal": 7},
            {"num": 8, "nombre": "Andrea Ramírez Silva", "edad": 22, "posicion": "Medio", "dorsal": 8},
            {"num": 9, "nombre": "Daniela Navarro Ortiz", "edad": 26, "posicion": "Medio", "dorsal": 10},
            {"num": 10, "nombre": "Regina Castillo Vega", "edad": 21, "posicion": "Delantera", "dorsal": 9},
            {"num": 11, "nombre": "Paola Herrera Díaz", "edad": 30, "posicion": "Delantera", "dorsal": 11},
            {"num": 12, "nombre": "Ximena Morales León", "edad": 20, "posicion": "Delantera", "dorsal": 12},
            {"num": 13, "nombre": "Gabriela Flores Ríos", "edad": 33, "posicion": "Medio", "dorsal": 13},
            {"num": 14, "nombre": "Lucía Pérez Castro", "edad": 35, "posicion": "Defensa", "dorsal": 14},
            {"num": 15, "nombre": "Natalia Romero Luna", "edad": 27, "posicion": "Delantera", "dorsal": 15}
        ]
    }
]

def generate_mysql_sql():
    lines = [
        "USE liga_femenil_db;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "TRUNCATE TABLE incidencias_partido;",
        "TRUNCATE TABLE partidos;",
        "TRUNCATE TABLE jugadoras;",
        "TRUNCATE TABLE equipos;",
        "TRUNCATE TABLE usuarios;",
        "TRUNCATE TABLE torneos;",
        "TRUNCATE TABLE jornadas;",
        "SET FOREIGN_KEY_CHECKS = 1;",
        "",
        "-- Torneo Oficial 4.ª Edición",
        "INSERT INTO torneos (id, nombre, fecha_inicio, activo) VALUES (1, '4.ª Edición - Liga de Fútbol Mujeres Diversas México', '2026-11-01', 1);",
        "",
        "-- Usuario Superadmin (password: Admin2026!)",
        "INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES (1, 'admin@ligafemenil.mx', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'superadmin', 'Directora de Liga');",
        ""
    ]

    user_id_counter = 2
    jugadora_id_counter = 1

    for team in OFFICIAL_TEAMS_DATA:
        team_id = team["id"]
        team_name = team["nombre"]
        capitana_email = team["email_capitana"]
        escudo = team["escudo_url"]
        
        # 1. Crear usuario capitana
        lines.append(f"-- Capitana de {team_name}")
        lines.append(
            f"INSERT INTO usuarios (id, email, password_hash, rol, nombre_contacto) VALUES "
            f"({user_id_counter}, '{capitana_email}', '$2y$10$eA35O2k5.Y6U2bV.6iY5A.a7m7k9c7Vb7r3.F0M9N1m8k7Y6U2bV.', 'capitana', 'Capitana {team_name}');"
        )
        capitana_id = user_id_counter
        user_id_counter += 1

        # 2. Crear equipo
        lines.append(
            f"INSERT INTO equipos (id, capitana_id, nombre, escudo_url, video_url) VALUES "
            f"({team_id}, {capitana_id}, '{team_name}', '{escudo}', NULL);"
        )

        # 3. Insertar jugadoras
        lines.append(f"-- Jugadoras de {team_name} (15 jugadoras)")
        jugadora_values = []
        for j in team["jugadoras"]:
            nom = j["nombre"].replace("'", "\\'")
            dorsal = j["dorsal"]
            pos = j["posicion"]
            jugadora_values.append(
                f"({jugadora_id_counter}, {team_id}, '{nom}', 'Ella', {dorsal}, '{pos}', NULL, 1, '{nom}', '55-0000-0000', 'Contacto Familiar', '55-1111-1111', 1, 0, 1)"
            )
            jugadora_id_counter += 1

        lines.append(
            "INSERT INTO jugadoras (id, equipo_id, nombre_deportivo, pronombres, dorsal, posicion, foto_url, autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre, contacto_emergencia_telefono, aviso_privacidad_aceptado, es_independiente, activo) VALUES\n"
            + ",\n".join(jugadora_values) + ";"
        )
        lines.append("")

    return "\n".join(lines)

def generate_frontend_mocks():
    # 1. MOCK_EQUIPOS
    equipos_ts = [
        "import { Equipo } from '../models';",
        "",
        "export const MOCK_EQUIPOS: Equipo[] = ["
    ]
    for t in OFFICIAL_TEAMS_DATA:
        equipos_ts.append("  {")
        equipos_ts.append(f"    id: {t['id']},")
        equipos_ts.append(f"    capitana_id: {t['id'] + 1},")
        equipos_ts.append(f"    nombre: '{t['nombre']}',")
        equipos_ts.append(f"    escudo_url: '{t['escudo_url']}',")
        equipos_ts.append("    video_url: null,")
        equipos_ts.append(f"    total_jugadoras: {len(t['jugadoras'])}")
        equipos_ts.append("  },")
    equipos_ts.append("];\n")

    # 2. MOCK_JUGADORAS
    jugadoras_ts = [
        "import { JugadoraPublica } from '../models';",
        "",
        "export const MOCK_JUGADORAS: JugadoraPublica[] = ["
    ]
    j_id = 1
    for t in OFFICIAL_TEAMS_DATA:
        jugadoras_ts.append(f"  // === {t['nombre']} (Equipo {t['id']}) ===")
        for j in t["jugadoras"]:
            nom = j["nombre"].replace("'", "\\'")
            dorsal = j["dorsal"]
            pos = j["posicion"]
            # Foto con placeholder de avatar elegante de fútbol
            jugadoras_ts.append("  {")
            jugadoras_ts.append(f"    id: {j_id},")
            jugadoras_ts.append(f"    equipo_id: {t['id']},")
            jugadoras_ts.append(f"    nombre_deportivo: '{nom}',")
            jugadoras_ts.append("    pronombres: 'Ella',")
            jugadoras_ts.append(f"    dorsal: {dorsal},")
            jugadoras_ts.append(f"    posicion: '{pos}',")
            jugadoras_ts.append("    foto_url: null,")
            jugadoras_ts.append("    autoriza_imagen: true,")
            jugadoras_ts.append("    es_independiente: false,")
            jugadoras_ts.append("    activo: true,")
            jugadoras_ts.append(f"    nombre_equipo: '{t['nombre']}'")
            jugadoras_ts.append("  },")
            j_id += 1
    jugadoras_ts.append("];\n")

    # 3. MOCK_POSICIONES
    # Tabla de posiciones con los 11 equipos ordenados
    stats_sample = [
        {"pj": 5, "g": 4, "e": 1, "p": 0, "gf": 14, "gc": 4, "pts": 13},
        {"pj": 5, "g": 4, "e": 0, "p": 1, "gf": 12, "gc": 5, "pts": 12},
        {"pj": 5, "g": 3, "e": 1, "p": 1, "gf": 10, "gc": 6, "pts": 10},
        {"pj": 5, "g": 3, "e": 0, "p": 2, "gf": 9, "gc": 7, "pts": 9},
        {"pj": 5, "g": 2, "e": 2, "p": 1, "gf": 8, "gc": 6, "pts": 8},
        {"pj": 5, "g": 2, "e": 1, "p": 2, "gf": 7, "gc": 8, "pts": 7},
        {"pj": 5, "g": 2, "e": 0, "p": 3, "gf": 6, "gc": 9, "pts": 6},
        {"pj": 5, "g": 1, "e": 1, "p": 3, "gf": 5, "gc": 10, "pts": 4},
        {"pj": 5, "g": 1, "e": 0, "p": 4, "gf": 4, "gc": 11, "pts": 3},
        {"pj": 5, "g": 0, "e": 2, "p": 3, "gf": 3, "gc": 9, "pts": 2},
        {"pj": 5, "g": 0, "e": 0, "p": 5, "gf": 2, "gc": 14, "pts": 0}
    ]

    posiciones_ts = [
        "import { PosicionTabla } from '../models';",
        "",
        "export const MOCK_POSICIONES: PosicionTabla[] = ["
    ]
    for idx, t in enumerate(OFFICIAL_TEAMS_DATA):
        st = stats_sample[idx]
        posiciones_ts.append("  {")
        posiciones_ts.append(f"    posicion: {idx + 1},")
        posiciones_ts.append(f"    equipo_id: {t['id']},")
        posiciones_ts.append(f"    nombre_equipo: '{t['nombre']}',")
        posiciones_ts.append(f"    escudo_url: '{t['escudo_url']}',")
        posiciones_ts.append(f"    pj: {st['pj']},")
        posiciones_ts.append(f"    pg: {st['g']},")
        posiciones_ts.append(f"    pe: {st['e']},")
        posiciones_ts.append(f"    pp: {st['p']},")
        posiciones_ts.append(f"    gf: {st['gf']},")
        posiciones_ts.append(f"    gc: {st['gc']},")
        posiciones_ts.append(f"    dg: {st['gf'] - st['gc']},")
        posiciones_ts.append(f"    pts: {st['pts']}")
        posiciones_ts.append("  },")
    posiciones_ts.append("];\n")

    return "\n".join(equipos_ts), "\n".join(jugadoras_ts), "\n".join(posiciones_ts)

def main():
    print("1. Generando SQL para MySQL liga_femenil_db...")
    sql_content = generate_mysql_sql()
    sql_path = "/opt/lampp/htdocs/liga-femenil/database/seed_oficial.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    print(f"   Archivo SQL generado en: {sql_path}")

    # Ejecutar en MySQL XAMPP
    print("2. Ejecutando poblado en MariaDB/MySQL...")
    cmd = f"/opt/lampp/bin/mysql -u root liga_femenil_db < {sql_path}"
    ret = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if ret.returncode != 0:
        print(f"Error ejecutando SQL: {ret.stderr}")
    else:
        print("   ¡Poblado en MySQL completado con éxito!")

    # Generar archivos TypeScript para el frontend
    print("3. Generando TypeScript mocks para Angular...")
    equipos_ts, jugadoras_ts, posiciones_ts = generate_frontend_mocks()

    with open("/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/equipos.mock.ts", "w", encoding="utf-8") as f:
        f.write(equipos_ts)
    print("   ✓ equipos.mock.ts actualizado (11 equipos)")

    with open("/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/jugadoras.mock.ts", "w", encoding="utf-8") as f:
        f.write(jugadoras_ts)
    print("   ✓ jugadoras.mock.ts actualizado (165 jugadoras oficiales)")

    with open("/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/posiciones.mock.ts", "w", encoding="utf-8") as f:
        f.write(posiciones_ts)
    print("   ✓ posiciones.mock.ts actualizado (11 equipos en tabla)")

    # Actualizar jornadas de ejemplo para que usen los IDs 1 a 11
    print("4. Verificando conteos finales...")
    cmd_count = "/opt/lampp/bin/mysql -u root liga_femenil_db -e 'SELECT COUNT(*) as equipos FROM equipos; SELECT COUNT(*) as jugadoras FROM jugadoras; SELECT COUNT(*) as usuarios FROM usuarios;'"
    subprocess.run(cmd_count, shell=True)

if __name__ == "__main__":
    main()
