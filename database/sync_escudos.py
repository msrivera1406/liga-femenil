import subprocess

ESCUDOS_MAPPING = [
    {"id": 1, "nombre": "QUEER GOALS", "escudo": "/images/Escudos/Queer_goals.jpeg"},
    {"id": 2, "nombre": "VALQUIRIAS", "escudo": "/images/Escudos/Valquirias.jpeg"},
    {"id": 3, "nombre": "GOOD VIBES", "escudo": "/images/Escudos/Good_vibes.jpeg"},
    {"id": 4, "nombre": "ALL STARS GV", "escudo": "/images/Escudos/all_stars.jpeg"},
    {"id": 5, "nombre": "TBD UNITED", "escudo": "/images/Escudos/TBD_united.jpeg"},
    {"id": 6, "nombre": "UNKNOWN", "escudo": "/images/Escudos/unknown.jpeg"},
    {"id": 7, "nombre": "F.C. LIONESSES", "escudo": "/images/Escudos/Lionesses.jpeg"},
    {"id": 8, "nombre": "BANDIDAS F.C.", "escudo": "/images/Escudos/bandidas.jpeg"},
    {"id": 9, "nombre": "REAL MADRID", "escudo": "/images/Escudos/real_madrid.jpeg"},
    {"id": 10, "nombre": "FÉNIX F.C.", "escudo": "/images/Escudos/fenix.jpeg"},
    {"id": 11, "nombre": "LOBAS MÉXICO", "escudo": "/images/Escudos/lobas.jpeg"},
]

def update_escudos():
    print("--- 1. Generando SQL de actualización de escudos ---")
    sql_lines = ["USE liga_femenil_db;"]
    for item in ESCUDOS_MAPPING:
        sql_lines.append(f"UPDATE equipos SET escudo_url = '{item['escudo']}' WHERE id = {item['id']};")
    
    sql_path = "/opt/lampp/htdocs/liga-femenil/database/update_escudos.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines) + "\n")

    print(f"--- 2. Ejecutando actualización en MySQL ---")
    cmd = f"/opt/lampp/bin/mysql -u root liga_femenil_db < {sql_path}"
    ret = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if ret.returncode != 0:
        print(f"Error en MySQL: {ret.stderr}")
    else:
        print("✓ Escudos actualizados en MySQL exitosamente.")

    # 3. Actualizar equipos.mock.ts
    print("--- 3. Actualizando frontend/src/app/core/mocks/equipos.mock.ts ---")
    equipos_file = "/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/equipos.mock.ts"
    equipos_ts = [
        "import { Equipo } from '../models';",
        "",
        "export const MOCK_EQUIPOS: Equipo[] = ["
    ]
    for item in ESCUDOS_MAPPING:
        equipos_ts.append("  {")
        equipos_ts.append(f"    id: {item['id']},")
        equipos_ts.append(f"    capitana_id: {item['id'] + 1},")
        equipos_ts.append(f"    nombre: '{item['nombre']}',")
        equipos_ts.append(f"    escudo_url: '{item['escudo']}',")
        equipos_ts.append("    video_url: null,")
        equipos_ts.append("    total_jugadoras: 15")
        equipos_ts.append("  },")
    equipos_ts.append("];\n")

    with open(equipos_file, "w", encoding="utf-8") as f:
        f.write("\n".join(equipos_ts))
    print("✓ equipos.mock.ts actualizado.")

    # 4. Actualizar posiciones.mock.ts
    print("--- 4. Actualizando frontend/src/app/core/mocks/posiciones.mock.ts ---")
    pos_file = "/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/posiciones.mock.ts"
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
    pos_ts = [
        "import { PosicionTabla } from '../models';",
        "",
        "export const MOCK_POSICIONES: PosicionTabla[] = ["
    ]
    for idx, item in enumerate(ESCUDOS_MAPPING):
        st = stats_sample[idx]
        pos_ts.append("  {")
        pos_ts.append(f"    posicion: {idx + 1},")
        pos_ts.append(f"    equipo_id: {item['id']},")
        pos_ts.append(f"    nombre_equipo: '{item['nombre']}',")
        pos_ts.append(f"    escudo_url: '{item['escudo']}',")
        pos_ts.append(f"    pj: {st['pj']},")
        pos_ts.append(f"    pg: {st['g']},")
        pos_ts.append(f"    pe: {st['e']},")
        pos_ts.append(f"    pp: {st['p']},")
        pos_ts.append(f"    gf: {st['gf']},")
        pos_ts.append(f"    gc: {st['gc']},")
        pos_ts.append(f"    dg: {st['gf'] - st['gc']},")
        pos_ts.append(f"    pts: {st['pts']}")
        pos_ts.append("  },")
    pos_ts.append("];\n")

    with open(pos_file, "w", encoding="utf-8") as f:
        f.write("\n".join(pos_ts))
    print("✓ posiciones.mock.ts actualizado.")

    # 5. Comprobación final en MySQL
    print("--- 5. Verificación de escudos en MySQL ---")
    check_cmd = "/opt/lampp/bin/mysql -u root liga_femenil_db -e 'SELECT id, nombre, escudo_url FROM equipos;'"
    subprocess.run(check_cmd, shell=True)

if __name__ == "__main__":
    update_escudos()
