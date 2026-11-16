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

        case 'equipo':
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
            if (empty($data['id'])) {
                echo json_encode(['ok' => false, 'error' => 'Falta el id de la jugadora']);
                break;
            }

            ejecutar($conn,
                "UPDATE jugadoras
                 SET equipo_id = ?, nombre_deportivo = ?, pronombres = ?, dorsal = ?, posicion = ?,
                     foto_url = ?, autoriza_imagen = ?, nombre_legal = ?, telefono_contacto = ?,
                     contacto_emergencia_nombre = ?, contacto_emergencia_telefono = ?, activo = ?
                 WHERE id = ?",
                [
                    $data['equipo_id'] ?? null,
                    $data['nombre_deportivo'],
                    $data['pronombres'] ?? 'Ella',
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