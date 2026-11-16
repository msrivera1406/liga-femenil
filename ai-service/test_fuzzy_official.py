from fuzzy_matcher import match_player_name

# Probar variaciones realistas de cómo un árbitro escribiría a mano a las jugadoras de QUEER GOALS
roster_queer_goals = [
    {"id": 1, "nombre": "Mariana López Hernández", "dorsal": 1},
    {"id": 2, "nombre": "Daniela Ramírez Cruz", "dorsal": 2},
    {"id": 3, "nombre": "Fernanda Castillo Morales", "dorsal": 3},
    {"id": 4, "nombre": "Andrea Sánchez Flores", "dorsal": 4},
    {"id": 5, "nombre": "Paola Jiménez Torres", "dorsal": 5},
    {"id": 6, "nombre": "Valeria Mendoza Ruiz", "dorsal": 6},
    {"id": 7, "nombre": "Karla Pérez García", "dorsal": 7},
    {"id": 8, "nombre": "Alejandra Reyes Luna", "dorsal": 8},
    {"id": 9, "nombre": "Gabriela Ortiz Vega", "dorsal": 10},
    {"id": 10, "nombre": "Sofía Navarro Díaz", "dorsal": 9},
    {"id": 11, "nombre": "Natalia Romero Silva", "dorsal": 11},
    {"id": 12, "nombre": "Brenda Aguilar Ríos", "dorsal": 12},
    {"id": 13, "nombre": "Ximena Flores Castro", "dorsal": 13},
    {"id": 14, "nombre": "Melissa Vargas León", "dorsal": 14},
    {"id": 15, "nombre": "Regina Torres Méndez", "dorsal": 15}
]

arbitro_inputs = [
    "Mariana Lopez",
    "Dany Ramirez",
    "Ma. Lopez Hdz",
    "Fernanda Castillo",
    "A. Sanchez",
    "Valeria Mendoza",
    "Sofia Navarro D.",
    "Brenda Aguilar R.",
    "Regina Torres Mtz"
]

print("=== PRUEBA DE FUZZY MATCHING CON JUGADORAS OFICIALES ===")
for inp in arbitro_inputs:
    match = match_player_name(inp, roster_queer_goals, threshold=60.0)
    print(f"Árbitro escribió: '{inp}' -> Match Oficial: '{match['nombre_oficial']}' (Dorsal #{match['dorsal_oficial']}, Confianza: {match['confidence']}%)")
