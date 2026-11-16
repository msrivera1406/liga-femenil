<?php

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);

    $conn = new mysqli("localhost", "root", "", "liga_femenil_db");

    function consulta($conn, $sql, $params) {
        $stmt = $conn->prepare($sql);
        if (count($params) > 0) {
            $stmt->execute($params);
        } else {
            $stmt->execute();
        }
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    switch ($data['filtro']) {

        case 'posiciones':
            $posiciones = consulta($conn, "SELECT * FROM vista_posiciones", []);
            echo json_encode($posiciones);
            break;

        case 'jornadas':
            $sql = "SELECT id AS jornada_id, torneo_id, numero_jornada, fecha_domingo FROM jornadas";
            $params = [];
            if (isset($data['torneo_id']) && $data['torneo_id'] != '') {
                $sql = $sql . " WHERE torneo_id = ?";
                $params[] = $data['torneo_id'];
            }
            $sql = $sql . " ORDER BY numero_jornada";

            $jornadas = consulta($conn, $sql, $params);

            foreach ($jornadas as $i => $j) {
                $jornadas[$i]['partidos'] = consulta($conn,
                    "SELECT p.id, p.horario, p.cancha, p.estado,
                            p.goles_local, p.goles_visitante,
                            p.penales_local, p.penales_visitante, p.ganador_id,
                            p.equipo_local_id, el.nombre AS equipo_local, el.escudo_url AS escudo_local,
                            p.equipo_visitante_id, ev.nombre AS equipo_visitante, ev.escudo_url AS escudo_visitante
                     FROM partidos p, equipos el, equipos ev
                     WHERE p.equipo_local_id = el.id
                       AND p.equipo_visitante_id = ev.id
                       AND p.jornada_id = ?
                     ORDER BY p.horario",
                    [$j['jornada_id']]);
            }

            echo json_encode($jornadas);
            break;

        case 'equipos':
            $equipos = consulta($conn,
                "SELECT e.id, e.nombre, e.escudo_url, e.video_url,
                        (SELECT u.nombre_contacto FROM usuarios u WHERE u.id = e.capitana_id) AS capitana
                 FROM equipos e
                 ORDER BY e.nombre", []);

            echo json_encode($equipos);
            break;

        case 'equipo_detalle':
            $equipo = consulta($conn,
                "SELECT id, nombre, escudo_url, video_url FROM equipos WHERE id = ?",
                [$data['id']]);

            $jugadoras = consulta($conn,
                "SELECT id, nombre_deportivo, pronombres, dorsal, posicion, foto_url, autoriza_imagen
                 FROM jugadoras
                 WHERE equipo_id = ? AND activo = 1
                 ORDER BY dorsal",
                [$data['id']]);

            $ficha = $equipo[0];
            $ficha['jugadoras'] = $jugadoras;

            echo json_encode($ficha);
            break;

        case 'lideres':
            $goleadoras = consulta($conn,
                "SELECT j.id AS jugadora_id, j.nombre_deportivo, j.foto_url, j.autoriza_imagen,
                        e.id AS equipo_id, e.nombre AS equipo, e.escudo_url,
                        COUNT(*) AS goles
                 FROM incidencias_partido i, jugadoras j, equipos e
                 WHERE i.jugadora_id = j.id
                   AND i.equipo_id = e.id
                   AND i.tipo = 'gol'
                 GROUP BY j.id, j.nombre_deportivo, j.foto_url, j.autoriza_imagen, e.id, e.nombre, e.escudo_url
                 ORDER BY goles DESC, j.nombre_deportivo ASC
                 LIMIT 10", []);

            $porteria = consulta($conn, "SELECT * FROM vista_porteria LIMIT 10", []);

            echo json_encode([
                'goleadoras' => $goleadoras,
                'porteria'   => $porteria
            ]);
            break;

        case 'entrenadores':
            $entrenadores = consulta($conn,
                "SELECT id, nombre_completo, disciplinas, zonas_cobertura, bio,
                        precio_sesion, telefono_publico, disponibilidad_json
                 FROM entrenadores
                 WHERE activo = 1
                 ORDER BY nombre_completo", []);

            echo json_encode($entrenadores);
            break;
    }

?>