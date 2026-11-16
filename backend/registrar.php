<?php

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);

    $conn = new mysqli("localhost", "root", "", "liga_femenil_db");

    function ejecutar($conn, $sql, $params) {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    switch ($data['filtro']) {

        case 'jugadora_independiente':
            if (empty($data['nombre_deportivo']) || empty($data['nombre_legal']) ||
                empty($data['posicion']) || empty($data['telefono_contacto']) ||
                empty($data['contacto_emergencia_nombre']) || empty($data['contacto_emergencia_telefono'])) {
                echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios']);
                break;
            }
            if (empty($data['aviso_privacidad_aceptado'])) {
                echo json_encode(['ok' => false, 'error' => 'Debes aceptar el aviso de privacidad']);
                break;
            }

            ejecutar($conn,
                "INSERT INTO jugadoras
                    (equipo_id, nombre_deportivo, pronombres, dorsal, posicion, foto_url,
                     autoriza_imagen, nombre_legal, telefono_contacto,
                     contacto_emergencia_nombre, contacto_emergencia_telefono,
                     aviso_privacidad_aceptado, es_independiente, activo)
                 VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)",
                [
                    $data['nombre_deportivo'],
                    $data['pronombres'] ?? 'Ella',
                    $data['dorsal'] ?? null,
                    $data['posicion'],
                    $data['foto_url'] ?? null,
                    $data['autoriza_imagen'] ?? 0,
                    $data['nombre_legal'],
                    $data['telefono_contacto'],
                    $data['contacto_emergencia_nombre'],
                    $data['contacto_emergencia_telefono']
                ]);

            echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
            break;

        case 'equipo':
            if (empty($data['nombre'])) {
                echo json_encode(['ok' => false, 'error' => 'Falta el nombre del equipo']);
                break;
            }

            $existe = ejecutar($conn, "SELECT id FROM equipos WHERE nombre = ?", [$data['nombre']]);
            if ($existe->get_result()->num_rows > 0) {
                echo json_encode(['ok' => false, 'error' => 'Ya existe un equipo con ese nombre']);
                break;
            }

            ejecutar($conn,
                "INSERT INTO equipos (capitana_id, nombre, escudo_url, video_url)
                 VALUES (?, ?, ?, ?)",
                [
                    $data['capitana_id'] ?? null,
                    $data['nombre'],
                    $data['escudo_url'] ?? null,
                    $data['video_url'] ?? null
                ]);

            echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
            break;

        case 'guardar_acta':
            $conn->begin_transaction();
            try {
                ejecutar($conn,
                    "UPDATE partidos
                     SET goles_local = ?, goles_visitante = ?, empate_minuto_18 = ?,
                         penales_local = ?, penales_visitante = ?, ganador_id = ?,
                         estado = 'finalizado', notas_mesa = ?
                     WHERE id = ?",
                    [
                        $data['goles_local'],
                        $data['goles_visitante'],
                        $data['empate_minuto_18'] ?? 0,
                        $data['penales_local'] ?? null,
                        $data['penales_visitante'] ?? null,
                        $data['ganador_id'],
                        $data['notas_mesa'] ?? null,
                        $data['partido_id']
                    ]);

                $incidencias = $data['incidencias'] ?? [];
                foreach ($incidencias as $inc) {
                    ejecutar($conn,
                        "INSERT INTO incidencias_partido (partido_id, jugadora_id, equipo_id, tipo, minuto)
                         VALUES (?, ?, ?, ?, ?)",
                        [
                            $data['partido_id'],
                            $inc['jugadora_id'],
                            $inc['equipo_id'],
                            $inc['tipo'],
                            $inc['minuto']
                        ]);
                }

                $conn->commit();
                echo json_encode(['ok' => true]);
            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el acta']);
            }
            break;
    }

?>