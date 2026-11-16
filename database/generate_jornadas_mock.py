import json
from seed_official_data import OFFICIAL_TEAMS_DATA

def generate_clean_jornadas():
    """
    Genera jornadas balanceadas para los 11 equipos de la Liga (5 partidos por jornada, 1 equipo descansa).
    Jornadas 1 a 4: Finalizadas con goles e incidencias de jugadoras reales.
    Jornada 5: En juego / Actual (con partidos programados para registrar).
    Jornadas 6 a 11: Programadas a futuro.
    """
    num_teams = len(OFFICIAL_TEAMS_DATA) # 11
    
    # Horarios estándar de los domingos
    horarios = ["09:00", "10:15", "11:30", "12:45", "14:00"]
    canchas = ["Cancha 1", "Cancha 2", "Cancha 1", "Cancha 2", "Cancha Principal"]

    # Round robin pairings para 11 equipos (usamos dummy 12 para el descanso)
    # Lista de equipos: 1 a 11
    teams = list(range(1, 12))
    # Agregar 'None' (descansa)
    teams_with_bye = teams + [None]
    n = len(teams_with_bye)

    jornadas_output = []
    partido_id_counter = 1
    inc_id_counter = 100

    fechas_domingos = [
        "2026-10-04", "2026-10-11", "2026-10-18", "2026-10-25", # J1 - J4 (Finalizadas)
        "2026-11-01", # J5 (Actual - En Juego / Programada)
        "2026-11-08", "2026-11-15", "2026-11-22", "2026-11-29", "2026-12-06", "2026-12-13" # J6 - J11
    ]

    for round_idx in range(11):
        j_num = round_idx + 1
        fecha = fechas_domingos[round_idx]
        is_finished = (j_num < 5)
        is_current = (j_num == 5)

        partidos_de_jornada = []

        # Generar emparejamientos de round-robin
        round_matches = []
        for i in range(n // 2):
            t1 = teams_with_bye[i]
            t2 = teams_with_bye[n - 1 - i]
            if t1 is not None and t2 is not None:
                # Alternar localía
                if round_idx % 2 == 1:
                    t1, t2 = t2, t1
                round_matches.append((t1, t2))

        # Rotar la lista para la siguiente jornada (fijando el primer elemento)
        teams_with_bye = [teams_with_bye[0]] + [teams_with_bye[-1]] + teams_with_bye[1:-1]

        # Crear los 5 partidos
        for m_idx, (loc_id, vis_id) in enumerate(round_matches):
            horario = horarios[m_idx]
            cancha = canchas[m_idx]
            
            loc_team = OFFICIAL_TEAMS_DATA[loc_id - 1]
            vis_team = OFFICIAL_TEAMS_DATA[vis_id - 1]

            if is_finished:
                # Partidos pasados con resultado
                goles_loc = (loc_id * 2 + round_idx + m_idx) % 4
                goles_vis = (vis_id + round_idx * 3) % 3
                estado = "finalizado"
                ganador_idx = "MOCK_EQUIPOS[" + str(loc_id - 1) + "]" if goles_loc > goles_vis else ("MOCK_EQUIPOS[" + str(vis_id - 1) + "]" if goles_vis > goles_loc else "undefined")
                ganador_id = loc_id if goles_loc > goles_vis else (vis_id if goles_vis > goles_loc else "null")
                
                # Crear incidencias con jugadoras reales
                incidencias = []
                # Goles local
                for g in range(goles_loc):
                    p = loc_team["jugadoras"][9 + g if (9 + g) < 15 else 9] # delanteras
                    incidencias.append({
                        "id": inc_id_counter,
                        "partido_id": partido_id_counter,
                        "jugadora_id": (loc_id - 1) * 15 + p["num"],
                        "equipo_id": loc_id,
                        "tipo": "gol",
                        "minuto": 12 + g * 20,
                        "nombre_jugadora": p["nombre"],
                        "nombre_equipo": loc_team["nombre"],
                        "dorsal": p["dorsal"]
                    })
                    inc_id_counter += 1

                # Goles visitante
                for g in range(goles_vis):
                    p = vis_team["jugadoras"][9 + g if (9 + g) < 15 else 9] # delanteras
                    incidencias.append({
                        "id": inc_id_counter,
                        "partido_id": partido_id_counter,
                        "jugadora_id": (vis_id - 1) * 15 + p["num"],
                        "equipo_id": vis_id,
                        "tipo": "gol",
                        "minuto": 18 + g * 22,
                        "nombre_jugadora": p["nombre"],
                        "nombre_equipo": vis_team["nombre"],
                        "dorsal": p["dorsal"]
                    })
                    inc_id_counter += 1

            elif is_current and m_idx == 0:
                # El primer partido de la jornada actual está "en juego" para probar
                goles_loc = 1
                goles_vis = 1
                estado = "en_juego"
                ganador_idx = "undefined"
                ganador_id = "null"
                p_loc = loc_team["jugadoras"][9]
                p_vis = vis_team["jugadoras"][9]
                incidencias = [
                    {
                        "id": inc_id_counter,
                        "partido_id": partido_id_counter,
                        "jugadora_id": (loc_id - 1) * 15 + p_loc["num"],
                        "equipo_id": loc_id,
                        "tipo": "gol",
                        "minuto": 14,
                        "nombre_jugadora": p_loc["nombre"],
                        "nombre_equipo": loc_team["nombre"],
                        "dorsal": p_loc["dorsal"]
                    },
                    {
                        "id": inc_id_counter + 1,
                        "partido_id": partido_id_counter,
                        "jugadora_id": (vis_id - 1) * 15 + p_vis["num"],
                        "equipo_id": vis_id,
                        "tipo": "gol",
                        "minuto": 27,
                        "nombre_jugadora": p_vis["nombre"],
                        "nombre_equipo": vis_team["nombre"],
                        "dorsal": p_vis["dorsal"]
                    }
                ]
                inc_id_counter += 2
            else:
                goles_loc = 0
                goles_vis = 0
                estado = "programado"
                ganador_idx = "undefined"
                ganador_id = "null"
                incidencias = []

            partido_obj = {
                "id": partido_id_counter,
                "jornada_id": j_num,
                "equipo_local_id": loc_id,
                "equipo_visitante_id": vis_id,
                "horario": horario,
                "goles_local": goles_loc,
                "goles_visitante": goles_vis,
                "empate_minuto_18": False,
                "penales_local": None,
                "penales_visitante": None,
                "ganador_id_raw": ganador_id,
                "estado": estado,
                "cancha": cancha,
                "notas_mesa": f"Partido de la 4.ª Edición - Jornada {j_num}",
                "equipo_local_idx": f"MOCK_EQUIPOS[{loc_id - 1}]",
                "equipo_visitante_idx": f"MOCK_EQUIPOS[{vis_id - 1}]",
                "ganador_idx": ganador_idx,
                "incidencias": incidencias
            }
            partidos_de_jornada.append(partido_obj)
            partido_id_counter += 1

        jornadas_output.append({
            "id": j_num,
            "torneo_id": 1,
            "numero_jornada": j_num,
            "fecha_domingo": fecha,
            "partidos": partidos_de_jornada
        })

    # Convertir a TypeScript
    ts_lines = [
        "import { Jornada } from '../models';",
        "import { MOCK_EQUIPOS } from './equipos.mock';",
        "",
        "export const MOCK_JORNADAS: Jornada[] = ["
    ]

    for j in jornadas_output:
        ts_lines.append("  {")
        ts_lines.append(f"    id: {j['id']},")
        ts_lines.append(f"    torneo_id: {j['torneo_id']},")
        ts_lines.append(f"    numero_jornada: {j['numero_jornada']},")
        ts_lines.append(f"    fecha_domingo: '{j['fecha_domingo']}',")
        ts_lines.append("    partidos: [")
        
        for p in j["partidos"]:
            ts_lines.append("      {")
            ts_lines.append(f"        id: {p['id']},")
            ts_lines.append(f"        jornada_id: {p['jornada_id']},")
            ts_lines.append(f"        equipo_local_id: {p['equipo_local_id']},")
            ts_lines.append(f"        equipo_visitante_id: {p['equipo_visitante_id']},")
            ts_lines.append(f"        horario: '{p['horario']}',")
            ts_lines.append(f"        goles_local: {p['goles_local']},")
            ts_lines.append(f"        goles_visitante: {p['goles_visitante']},")
            ts_lines.append(f"        empate_minuto_18: false,")
            ts_lines.append(f"        penales_local: null,")
            ts_lines.append(f"        penales_visitante: null,")
            ts_lines.append(f"        ganador_id: {p['ganador_id_raw']},")
            ts_lines.append(f"        estado: '{p['estado']}',")
            ts_lines.append(f"        cancha: '{p['cancha']}',")
            ts_lines.append(f"        notas_mesa: '{p['notas_mesa']}',")
            ts_lines.append(f"        equipo_local: {p['equipo_local_idx']},")
            ts_lines.append(f"        equipo_visitante: {p['equipo_visitante_idx']},")
            ts_lines.append(f"        ganador: {p['ganador_idx']},")
            
            # Incidencias
            if p["incidencias"]:
                ts_lines.append("        incidencias: [")
                for inc in p["incidencias"]:
                    ts_lines.append("          {")
                    ts_lines.append(f"            id: {inc['id']},")
                    ts_lines.append(f"            partido_id: {inc['partido_id']},")
                    ts_lines.append(f"            jugadora_id: {inc['jugadora_id']},")
                    ts_lines.append(f"            equipo_id: {inc['equipo_id']},")
                    ts_lines.append(f"            tipo: '{inc['tipo']}',")
                    ts_lines.append(f"            minuto: {inc['minuto']},")
                    ts_lines.append(f"            nombre_jugadora: '{inc['nombre_jugadora']}',")
                    ts_lines.append(f"            nombre_equipo: '{inc['nombre_equipo']}',")
                    ts_lines.append(f"            dorsal: {inc['dorsal']}")
                    ts_lines.append("          },")
                ts_lines.append("        ]")
            else:
                ts_lines.append("        incidencias: []")
            
            ts_lines.append("      },")
        ts_lines.append("    ]")
        ts_lines.append("  },")

    ts_lines.append("];\n")
    return "\n".join(ts_lines)

if __name__ == "__main__":
    content = generate_clean_jornadas()
    target_file = "/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/jornadas.mock.ts"
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ jornadas.mock.ts generado exitosamente con los 11 equipos oficiales!")
