import os
import shutil
import subprocess

# Mapeo exacto de las carpetas de fotos a cada equipo y su slug
FOLDER_MAPPING = [
    {
        "team_id": 1,
        "team_name": "QUEER GOALS",
        "slug": "queer-goals",
        "source_folder": "Queer Goals_recortadas"
    },
    {
        "team_id": 2,
        "team_name": "VALQUIRIAS",
        "slug": "valquirias",
        "source_folder": "Valquirias_recortadas"
    },
    {
        "team_id": 3,
        "team_name": "GOOD VIBES",
        "slug": "good-vibes",
        "source_folder": "Good Vibes_recortadas"
    },
    {
        "team_id": 4,
        "team_name": "ALL STARS GV",
        "slug": "all-stars-gv",
        "source_folder": "All Stars GV_recortadas"
    },
    {
        "team_id": 5,
        "team_name": "TBD UNITED",
        "slug": "tbd-united",
        "source_folder": "TBD United_recortadas"
    },
    {
        "team_id": 6,
        "team_name": "UNKNOWN",
        "slug": "unknown",
        "source_folder": "Unknown_recortadas"
    },
    {
        "team_id": 7,
        "team_name": "F.C. LIONESSES",
        "slug": "fc-lionesses",
        "source_folder": "F.C. Lionesses_recortadas"
    },
    {
        "team_id": 8,
        "team_name": "BANDIDAS F.C.",
        "slug": "bandidas-fc",
        "source_folder": "Bandidas F.C_recortadas"
    },
    {
        "team_id": 9,
        "team_name": "REAL MADRID",
        "slug": "real-madrid",
        "source_folder": "RealMadrid_recortadas"
    },
    {
        "team_id": 10,
        "team_name": "FÉNIX F.C.",
        "slug": "fenix-fc",
        "source_folder": "FenixFC_recortadas"
    },
    {
        "team_id": 11,
        "team_name": "LOBAS MÉXICO",
        "slug": "lobas-mexico",
        "source_folder": "LobasMéxico_recortadas"
    }
]

BASE_SOURCE = "/opt/lampp/htdocs/liga-femenil/images/Fotos Jugadoras"
BASE_DEST = "/opt/lampp/htdocs/liga-femenil/frontend/public/images/jugadoras"

def sync_player_photos():
    print("--- 1. Copiando y organizando 165 fotos en frontend/public/images/jugadoras ---")
    os.makedirs(BASE_DEST, exist_ok=True)
    
    total_copied = 0
    sql_updates = ["USE liga_femenil_db;"]

    for item in FOLDER_MAPPING:
        team_id = item["team_id"]
        slug = item["slug"]
        src_folder = os.path.join(BASE_SOURCE, item["source_folder"])
        dst_folder = os.path.join(BASE_DEST, slug)
        os.makedirs(dst_folder, exist_ok=True)

        print(f"-> Procesando {item['team_name']} ({slug})...")
        for i in range(1, 16):
            filename = f"jugadora_{i:02d}.jpg"
            src_file = os.path.join(src_folder, filename)
            dst_file = os.path.join(dst_folder, filename)
            
            if os.path.exists(src_file):
                shutil.copy2(src_file, dst_file)
                total_copied += 1
            else:
                print(f"   [AVISO] Archivo no encontrado: {src_file}")

            # Calcular ID de la jugadora en base de datos
            player_id = (team_id - 1) * 15 + i
            public_url = f"/images/jugadoras/{slug}/{filename}"
            sql_updates.append(f"UPDATE jugadoras SET foto_url = '{public_url}' WHERE id = {player_id};")

    print(f"\n✓ Se copiaron exitosamente {total_copied} archivos de imagen.")

    # Guardar script SQL de actualización
    sql_file = "/opt/lampp/htdocs/liga-femenil/database/update_fotos.sql"
    with open(sql_file, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_updates) + "\n")
    print(f"--- 2. Ejecutando actualización en MySQL ({sql_file}) ---")

    cmd = f"/opt/lampp/bin/mysql -u root liga_femenil_db < {sql_file}"
    ret = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if ret.returncode != 0:
        print(f"Error en MySQL: {ret.stderr}")
    else:
        print("✓ Actualización en base de datos MySQL completada con éxito.")

    # 3. Actualizar MOCK_JUGADORAS en Angular
    print("--- 3. Actualizando MOCK_JUGADORAS en Angular frontend ---")
    mock_file = "/opt/lampp/htdocs/liga-femenil/frontend/src/app/core/mocks/jugadoras.mock.ts"
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Reemplazar foto_url: null por la URL generada
    from seed_official_data import OFFICIAL_TEAMS_DATA
    
    jugadoras_ts = [
        "import { JugadoraPublica } from '../models';",
        "",
        "export const MOCK_JUGADORAS: JugadoraPublica[] = ["
    ]
    j_id = 1
    for t in OFFICIAL_TEAMS_DATA:
        slug = next(m["slug"] for m in FOLDER_MAPPING if m["team_id"] == t["id"])
        jugadoras_ts.append(f"  // === {t['nombre']} (Equipo {t['id']}) ===")
        for idx, j in enumerate(t["jugadoras"], 1):
            nom = j["nombre"].replace("'", "\\'")
            dorsal = j["dorsal"]
            pos = j["posicion"]
            foto_url = f"/images/jugadoras/{slug}/jugadora_{idx:02d}.jpg"
            jugadoras_ts.append("  {")
            jugadoras_ts.append(f"    id: {j_id},")
            jugadoras_ts.append(f"    equipo_id: {t['id']},")
            jugadoras_ts.append(f"    nombre_deportivo: '{nom}',")
            jugadoras_ts.append("    pronombres: 'Ella',")
            jugadoras_ts.append(f"    dorsal: {dorsal},")
            jugadoras_ts.append(f"    posicion: '{pos}',")
            jugadoras_ts.append(f"    foto_url: '{foto_url}',")
            jugadoras_ts.append("    autoriza_imagen: true,")
            jugadoras_ts.append("    es_independiente: false,")
            jugadoras_ts.append("    activo: true,")
            jugadoras_ts.append(f"    nombre_equipo: '{t['nombre']}'")
            jugadoras_ts.append("  },")
            j_id += 1
    jugadoras_ts.append("];\n")

    with open(mock_file, "w", encoding="utf-8") as f:
        f.write("\n".join(jugadoras_ts))
    print(f"✓ {mock_file} actualizado con las URLs de las fotos.")

    # 4. Verificación en MySQL
    print("--- 4. Verificando conteo de jugadoras con foto en MySQL ---")
    check_cmd = "/opt/lampp/bin/mysql -u root liga_femenil_db -e \"SELECT COUNT(*) as con_foto FROM jugadoras WHERE foto_url IS NOT NULL; SELECT id, equipo_id, dorsal, nombre_deportivo, foto_url FROM jugadoras LIMIT 5;\""
    subprocess.run(check_cmd, shell=True)

if __name__ == "__main__":
    sync_player_photos()
