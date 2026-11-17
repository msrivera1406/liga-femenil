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

        case 'jugadora_independiente':
            // Limpiar textos
            $campos_texto = ['nombre_deportivo', 'nombre_legal', 'telefono_contacto',
                             'contacto_emergencia_nombre', 'contacto_emergencia_telefono',
                             'contacto_emergencia_parentesco', 'alergias_condiciones'];
            foreach ($campos_texto as $campo) {
                $data[$campo] = isset($data[$campo]) ? trim((string) $data[$campo]) : '';
            }

            if ($data['nombre_deportivo'] === '' || $data['nombre_legal'] === '' ||
                empty($data['posicion']) || $data['telefono_contacto'] === '' ||
                $data['contacto_emergencia_nombre'] === '' || $data['contacto_emergencia_telefono'] === '' ||
                $data['contacto_emergencia_parentesco'] === '' || empty($data['nivel_experiencia']) ||
                empty($data['edad']) || empty($data['tipo_sangre'])) {
                echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios']);
                break;
            }
            if (empty($data['aviso_privacidad_aceptado'])) {
                echo json_encode(['ok' => false, 'error' => 'Debes aceptar el aviso de privacidad']);
                break;
            }

            // Validar valores contra los permitidos por la base de datos
            $posiciones = ['Portera', 'Defensa', 'Medio', 'Delantera'];
            $niveles    = ['Iniciación', 'Intermedio', 'Avanzado'];
            $sangres    = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Desconocido'];
            $edad       = filter_var($data['edad'], FILTER_VALIDATE_INT,
                                     ['options' => ['min_range' => 16, 'max_range' => 65]]);

            if (!in_array($data['posicion'], $posiciones, true) ||
                !in_array($data['nivel_experiencia'], $niveles, true) ||
                !in_array($data['tipo_sangre'], $sangres, true) ||
                $edad === false) {
                echo json_encode(['ok' => false, 'error' => 'Hay datos con un valor no válido']);
                break;
            }
            if (mb_strlen($data['nombre_deportivo']) > 80 || mb_strlen($data['nombre_legal']) > 120 ||
                mb_strlen($data['telefono_contacto']) > 20 || mb_strlen($data['contacto_emergencia_nombre']) > 100 ||
                mb_strlen($data['contacto_emergencia_telefono']) > 20 || mb_strlen($data['contacto_emergencia_parentesco']) > 30 ||
                mb_strlen($data['alergias_condiciones']) > 1000) {
                echo json_encode(['ok' => false, 'error' => 'Algún dato excede la longitud permitida']);
                break;
            }

            // Jugadora y datos médicos se guardan juntos o no se guarda nada
            $conn->begin_transaction();
            try {
                ejecutar($conn,
                    "INSERT INTO jugadoras
                        (equipo_id, nombre_deportivo, posicion, nivel_experiencia, edad,
                         autoriza_imagen, nombre_legal, telefono_contacto,
                         contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_parentesco,
                         aviso_privacidad_aceptado, es_independiente, activo)
                     VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)",
                    [
                        $data['nombre_deportivo'],
                        $data['posicion'],
                        $data['nivel_experiencia'],
                        $edad,
                        empty($data['autoriza_imagen']) ? 0 : 1,
                        $data['nombre_legal'],
                        $data['telefono_contacto'],
                        $data['contacto_emergencia_nombre'],
                        $data['contacto_emergencia_telefono'],
                        $data['contacto_emergencia_parentesco']
                    ]);
                $jugadora_id = $conn->insert_id;

                ejecutar($conn,
                    "INSERT INTO jugadoras_datos_medicos (jugadora_id, tipo_sangre, alergias_condiciones)
                     VALUES (?, ?, ?)",
                    [
                        $jugadora_id,
                        $data['tipo_sangre'],
                        $data['alergias_condiciones'] !== '' ? $data['alergias_condiciones'] : null
                    ]);

                $conn->commit();
                echo json_encode([
                    'ok' => true,
                    'id' => $jugadora_id,
                    'folio_registro' => 'IND-' . str_pad((string) $jugadora_id, 5, '0', STR_PAD_LEFT)
                ]);
            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(['ok' => false, 'error' => 'No se pudo completar el registro']);
            }
            break;

        case 'equipo':
            requerir_rol(['superadmin']);
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
            requerir_rol(['superadmin']);
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