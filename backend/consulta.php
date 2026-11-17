<?php
    require_once __DIR__ . '/comun.php';
    preparar_respuesta();

    $data = leer_json();
    if (empty($data['filtro'])) {
        responder_error(400, 'Falta el filtro de la petición');
    }

    $conn = conectar();

    // Ficha completa de jugadora, con datos privados y médicos. Solo para filtros con sesión.
    const SQL_JUGADORA_PRIVADA =
        "SELECT j.id, j.equipo_id, e.nombre AS nombre_equipo, j.nombre_deportivo, j.dorsal, j.posicion,
                j.nivel_experiencia, j.edad, j.foto_url, j.autoriza_imagen, j.nombre_legal, j.telefono_contacto,
                j.contacto_emergencia_nombre, j.contacto_emergencia_telefono, j.contacto_emergencia_parentesco,
                j.aviso_privacidad_aceptado, j.es_independiente, j.activo, j.creado_en,
                m.tipo_sangre, m.alergias_condiciones
         FROM jugadoras j
         LEFT JOIN equipos e ON e.id = j.equipo_id
         LEFT JOIN jugadoras_datos_medicos m ON m.jugadora_id = j.id";

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

            // Racha: resultado de los últimos 4 partidos finalizados de cada equipo,
            // del más antiguo al más reciente ('G' ganado, 'P' perdido; no hay empates)
            $resultados = consulta($conn,
                "SELECT p.equipo_local_id, p.equipo_visitante_id, p.ganador_id
                 FROM partidos p
                 JOIN jornadas jo ON jo.id = p.jornada_id
                 WHERE p.estado = 'finalizado' AND p.ganador_id IS NOT NULL
                 ORDER BY jo.numero_jornada, p.horario, p.id", []);
            $rachas = [];
            foreach ($resultados as $r) {
                foreach ([$r['equipo_local_id'], $r['equipo_visitante_id']] as $equipo) {
                    $rachas[$equipo][] = (int) $r['ganador_id'] === (int) $equipo ? 'G' : 'P';
                }
            }
            foreach ($posiciones as $i => $fila) {
                $posiciones[$i]['racha'] = implode('', array_slice($rachas[$fila['equipo_id']] ?? [], -4));
            }

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
            $es_directora = (usuario_actual()['rol'] ?? null) === 'superadmin';

            foreach ($jornadas as $i => $j) {
                $jornadas[$i]['partidos'] = consulta($conn,
                    "SELECT p.id, p.jornada_id, p.horario, p.cancha, p.estado,
                            p.goles_local, p.goles_visitante, p.empate_minuto_18, p.notas_mesa,
                            p.penales_local, p.penales_visitante, p.ganador_id,
                            p.equipo_local_id, el.nombre AS equipo_local, el.escudo_url AS escudo_local,
                            p.equipo_visitante_id, ev.nombre AS equipo_visitante, ev.escudo_url AS escudo_visitante
                     FROM partidos p, equipos el, equipos ev
                     WHERE p.equipo_local_id = el.id
                       AND p.equipo_visitante_id = ev.id
                       AND p.jornada_id = ?
                     ORDER BY p.horario",
                    [$j['jornada_id']]);

                // Las notas de mesa son internas: solo las ve la Directora
                if (!$es_directora) {
                    foreach ($jornadas[$i]['partidos'] as $k => $p) {
                        unset($jornadas[$i]['partidos'][$k]['notas_mesa']);
                    }
                }

                // Incidencias públicas de cada partido (solo nombre deportivo y dorsal)
                foreach ($jornadas[$i]['partidos'] as $k => $p) {
                    $jornadas[$i]['partidos'][$k]['incidencias'] = consulta($conn,
                        "SELECT i.id, i.partido_id, i.jugadora_id, i.equipo_id, i.tipo, i.minuto,
                                j.nombre_deportivo AS nombre_jugadora, j.dorsal, e.nombre AS nombre_equipo
                         FROM incidencias_partido i, jugadoras j, equipos e
                         WHERE i.jugadora_id = j.id
                           AND i.equipo_id = e.id
                           AND i.partido_id = ?
                         ORDER BY i.minuto",
                        [$p['id']]);
                }
            }

            echo json_encode($jornadas);
            break;

        case 'equipos':
            $equipos = consulta($conn,
                "SELECT e.id, e.capitana_id, e.nombre, e.escudo_url, e.video_url, e.activo,
                        (SELECT u.nombre_contacto FROM usuarios u WHERE u.id = e.capitana_id) AS capitana,
                        (SELECT COUNT(*) FROM jugadoras j WHERE j.equipo_id = e.id AND j.activo = 1) AS total_jugadoras
                 FROM equipos e
                 WHERE e.activo = 1
                 ORDER BY e.nombre", []);

            echo json_encode($equipos);
            break;

        case 'equipo_detalle':
            $equipo = consulta($conn,
                "SELECT id, capitana_id, nombre, escudo_url, video_url FROM equipos WHERE id = ? AND activo = 1",
                [$data['id'] ?? 0]);

            if (count($equipo) === 0) {
                echo json_encode(['ok' => false, 'error' => 'Equipo no encontrado']);
                break;
            }

            $jugadoras = consulta($conn,
                "SELECT id, nombre_deportivo, dorsal, posicion,
                        CASE WHEN autoriza_imagen = 1 THEN foto_url END AS foto_url, autoriza_imagen
                 FROM jugadoras
                 WHERE equipo_id = ? AND activo = 1
                 ORDER BY dorsal",
                [$data['id']]);

            $ficha = $equipo[0];
            $ficha['jugadoras'] = $jugadoras;

            echo json_encode($ficha);
            break;

        // Jugadoras destacadas. Solo cuentan partidos finalizados, como la tabla de posiciones.
        // Si una jugadora no autorizó su imagen, su foto no sale del servidor (modo Ghost Player).
        case 'lideres':
            $goleadoras = consulta($conn,
                "SELECT j.id AS jugadora_id, j.nombre_deportivo, j.dorsal,
                        CASE WHEN j.autoriza_imagen = 1 THEN j.foto_url END AS foto_url, j.autoriza_imagen,
                        e.id AS equipo_id, e.nombre AS equipo, e.escudo_url,
                        COUNT(*) AS goles,
                        COUNT(DISTINCT i.partido_id) AS partidos_con_gol,
                        (SELECT vp.PJ FROM vista_posiciones vp WHERE vp.equipo_id = e.id) AS partidos_equipo
                 FROM incidencias_partido i
                 JOIN partidos p ON p.id = i.partido_id AND p.estado = 'finalizado'
                 JOIN jugadoras j ON j.id = i.jugadora_id AND j.activo = 1
                 JOIN equipos e ON e.id = i.equipo_id AND e.activo = 1
                 WHERE i.tipo = 'gol'
                 GROUP BY j.id, j.nombre_deportivo, j.dorsal, j.foto_url, j.autoriza_imagen, e.id, e.nombre, e.escudo_url
                 ORDER BY goles DESC, partidos_con_gol ASC, j.nombre_deportivo ASC
                 LIMIT 10", []);

            // Porteras: el equipo con más vallas invictas (desempata quien recibe menos goles por
            // partido) y su portera titular (la portera activa con el dorsal más bajo)
            $porteria = consulta($conn,
                "SELECT vp.equipo_id, vp.equipo, vp.escudo_url, vp.PJ, vp.vallas_invictas, vp.promedio,
                        pos.GC AS goles_recibidos,
                        j.id AS jugadora_id, j.nombre_deportivo, j.dorsal,
                        CASE WHEN j.autoriza_imagen = 1 THEN j.foto_url END AS foto_url, j.autoriza_imagen
                 FROM vista_porteria vp
                 JOIN vista_posiciones pos ON pos.equipo_id = vp.equipo_id
                 LEFT JOIN jugadoras j ON j.id = (
                     SELECT j2.id FROM jugadoras j2
                     WHERE j2.equipo_id = vp.equipo_id AND j2.posicion = 'Portera' AND j2.activo = 1
                     ORDER BY j2.dorsal IS NULL, j2.dorsal, j2.id LIMIT 1)
                 WHERE vp.PJ > 0
                 ORDER BY vp.vallas_invictas DESC, pos.GC / vp.PJ ASC, vp.equipo ASC
                 LIMIT 10", []);

            // Figura de la jornada: quien más goles anotó en la última jornada con partidos finalizados
            $mvp = consulta($conn,
                "SELECT jo.numero_jornada, j.id AS jugadora_id, j.nombre_deportivo, j.dorsal,
                        CASE WHEN j.autoriza_imagen = 1 THEN j.foto_url END AS foto_url, j.autoriza_imagen,
                        e.id AS equipo_id, e.nombre AS equipo, e.escudo_url,
                        COUNT(*) AS goles,
                        p.goles_local, p.goles_visitante,
                        IF(p.equipo_local_id = e.id, ev.nombre, el.nombre) AS rival,
                        p.ganador_id = e.id AS gano
                 FROM incidencias_partido i
                 JOIN partidos p ON p.id = i.partido_id AND p.estado = 'finalizado'
                 JOIN jornadas jo ON jo.id = p.jornada_id
                 JOIN jugadoras j ON j.id = i.jugadora_id AND j.activo = 1
                 JOIN equipos e ON e.id = i.equipo_id AND e.activo = 1
                 JOIN equipos el ON el.id = p.equipo_local_id
                 JOIN equipos ev ON ev.id = p.equipo_visitante_id
                 WHERE i.tipo = 'gol'
                   AND jo.numero_jornada = (
                       SELECT MAX(jo2.numero_jornada) FROM jornadas jo2
                       JOIN partidos p2 ON p2.jornada_id = jo2.id AND p2.estado = 'finalizado')
                 GROUP BY i.partido_id, j.id
                 ORDER BY goles DESC, gano DESC, MIN(i.minuto) ASC
                 LIMIT 1", []);

            echo json_encode([
                'goleadoras'  => $goleadoras,
                'porteria'    => $porteria,
                'mvp_jornada' => $mvp[0] ?? null
            ]);
            break;

        case 'entrenadores':
            $entrenadores = consulta($conn,
                "SELECT id, nombre_completo, disciplinas, zonas_cobertura, bio,
                        precio_sesion, telefono_publico, disponibilidad_json, foto_url, activo
                 FROM entrenadores
                 WHERE activo = 1
                 ORDER BY nombre_completo", []);

            echo json_encode($entrenadores);
            break;

        // ---------- Consultas privadas (requieren sesión) ----------

        case 'jugadoras_admin':
            requerir_rol(['superadmin']);
            echo json_encode(consulta($conn,
                SQL_JUGADORA_PRIVADA . " WHERE j.activo = 1 ORDER BY e.nombre IS NULL, e.nombre, j.dorsal, j.nombre_deportivo", []));
            break;

        case 'plantel_privado':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            $equipo_id = (int) ($data['equipo_id'] ?? 0);
            if ($usuario['rol'] === 'capitana' && $equipo_id !== (int) $usuario['equipo_id']) {
                responder_error(403, 'Solo puedes consultar el plantel de tu equipo');
            }
            echo json_encode(consulta($conn,
                SQL_JUGADORA_PRIVADA . " WHERE j.equipo_id = ? AND j.activo = 1 ORDER BY j.dorsal, j.nombre_deportivo", [$equipo_id]));
            break;

        case 'entrenadores_admin':
            requerir_rol(['superadmin']);
            echo json_encode(consulta($conn,
                "SELECT id, nombre_completo, disciplinas, zonas_cobertura, bio,
                        precio_sesion, telefono_publico, disponibilidad_json, foto_url, activo
                 FROM entrenadores
                 ORDER BY nombre_completo", []));
            break;

        default:
            echo json_encode(['ok' => false, 'error' => 'Filtro de consulta no válido']);
            break;
    }

?>