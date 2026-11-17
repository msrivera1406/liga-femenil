<?php
    require_once __DIR__ . '/comun.php';
    preparar_respuesta();

    $data = leer_json();
    if (empty($data['filtro'])) {
        responder_error(400, 'Falta el filtro de la petición');
    }

    $conn = conectar();

    function ejecutar($conn, $sql, $params) {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    switch ($data['filtro']) {

        case 'equipo':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            if ($usuario['rol'] === 'capitana') {
                if ((int) ($data['id'] ?? 0) !== (int) $usuario['equipo_id']) {
                    responder_error(403, 'Solo puedes editar tu propio equipo');
                }
                $data['capitana_id'] = $usuario['id']; // una capitana no puede reasignar la capitanía
            }
            if (empty($data['id'])) {
                echo json_encode(['ok' => false, 'error' => 'Falta el id del equipo']);
                break;
            }
            if (empty($data['nombre'])) {
                echo json_encode(['ok' => false, 'error' => 'Falta el nombre del equipo']);
                break;
            }

            $existe = ejecutar($conn,
                "SELECT id FROM equipos WHERE nombre = ? AND id <> ?",
                [$data['nombre'], $data['id']]);
            if ($existe->get_result()->num_rows > 0) {
                echo json_encode(['ok' => false, 'error' => 'Ya existe otro equipo con ese nombre']);
                break;
            }

            ejecutar($conn,
                "UPDATE equipos
                 SET nombre = ?, escudo_url = ?, video_url = ?, capitana_id = ?
                 WHERE id = ?",
                [
                    $data['nombre'],
                    $data['escudo_url'] ?? null,
                    $data['video_url'] ?? null,
                    $data['capitana_id'] ?? null,
                    $data['id']
                ]);

            echo json_encode(['ok' => true]);
            break;

        case 'jugadora':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            if ($usuario['rol'] === 'capitana') {
                $actual = ejecutar($conn, "SELECT equipo_id FROM jugadoras WHERE id = ?", [$data['id'] ?? 0])
                    ->get_result()->fetch_assoc();
                if (!$actual || (int) $actual['equipo_id'] !== (int) $usuario['equipo_id']) {
                    responder_error(403, 'Solo puedes editar jugadoras de tu equipo');
                }
                $data['equipo_id'] = $usuario['equipo_id']; // no puede moverla a otro equipo
            }
            if (empty($data['id'])) {
                echo json_encode(['ok' => false, 'error' => 'Falta el id de la jugadora']);
                break;
            }

            ejecutar($conn,
                "UPDATE jugadoras
                 SET equipo_id = ?, nombre_deportivo = ?, dorsal = ?, posicion = ?,
                     foto_url = ?, autoriza_imagen = ?, nombre_legal = ?, telefono_contacto = ?,
                     contacto_emergencia_nombre = ?, contacto_emergencia_telefono = ?, activo = ?
                 WHERE id = ?",
                [
                    $data['equipo_id'] ?? null,
                    $data['nombre_deportivo'],
                    $data['dorsal'] ?? null,
                    $data['posicion'],
                    $data['foto_url'] ?? null,
                    $data['autoriza_imagen'] ?? 0,
                    $data['nombre_legal'],
                    $data['telefono_contacto'],
                    $data['contacto_emergencia_nombre'],
                    $data['contacto_emergencia_telefono'],
                    $data['activo'] ?? 1,
                    $data['id']
                ]);

            echo json_encode(['ok' => true]);
            break;
    }

?>