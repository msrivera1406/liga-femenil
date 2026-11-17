<?php
    require_once __DIR__ . '/comun.php';
    require_once __DIR__ . '/validaciones.php';
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

        case 'jugadora':
            // La Directora da de alta en cualquier equipo (o en la bolsa); una capitana solo en el suyo
            $usuario = requerir_rol(['superadmin', 'capitana']);
            if ($usuario['rol'] === 'capitana') {
                $data['equipo_id'] = $usuario['equipo_id'];
            }
            $j = normalizar_jugadora($conn, $data);
            if (is_string($j)) {
                responder_error(400, $j);
            }
            $conn->begin_transaction();
            try {
                ejecutar($conn,
                    "INSERT INTO jugadoras
                        (equipo_id, nombre_deportivo, dorsal, posicion, nivel_experiencia, edad, foto_url,
                         autoriza_imagen, nombre_legal, telefono_contacto, contacto_emergencia_nombre,
                         contacto_emergencia_telefono, contacto_emergencia_parentesco,
                         aviso_privacidad_aceptado, es_independiente, activo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)",
                    [$j['equipo_id'], $j['nombre_deportivo'], $j['dorsal'], $j['posicion'], $j['nivel_experiencia'],
                     $j['edad'], $j['foto_url'], $j['autoriza_imagen'], $j['nombre_legal'], $j['telefono_contacto'],
                     $j['contacto_emergencia_nombre'], $j['contacto_emergencia_telefono'],
                     $j['contacto_emergencia_parentesco'], $j['es_independiente']]);
                $id = $conn->insert_id;
                guardar_datos_medicos($conn, $id, $j['tipo_sangre'], $j['alergias_condiciones']);
                $conn->commit();
                echo json_encode(['ok' => true, 'id' => $id]);
            } catch (Exception $e) {
                $conn->rollback();
                responder_error(500, 'No se pudo registrar a la jugadora');
            }
            break;

        case 'entrenador':
            requerir_rol(['superadmin']);
            $e = normalizar_entrenador($data);
            if (is_string($e)) {
                responder_error(400, $e);
            }
            ejecutar($conn,
                "INSERT INTO entrenadores
                    (nombre_completo, disciplinas, zonas_cobertura, bio, precio_sesion,
                     telefono_publico, disponibilidad_json, foto_url, activo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$e['nombre_completo'], $e['disciplinas'], $e['zonas_cobertura'], $e['bio'], $e['precio_sesion'],
                 $e['telefono_publico'], $e['disponibilidad_json'], $e['foto_url'], $e['activo']]);
            echo json_encode(['ok' => true, 'id' => $conn->insert_id]);
            break;

        case 'guardar_acta':
            requerir_rol(['superadmin']);

            $partido_id = (int) ($data['partido_id'] ?? 0);
            $partido = ejecutar($conn, "SELECT id, equipo_local_id, equipo_visitante_id FROM partidos WHERE id = ?", [$partido_id])
                ->get_result()->fetch_assoc();
            if (!$partido) {
                responder_error(404, 'El partido no existe');
            }
            $local = (int) $partido['equipo_local_id'];
            $visitante = (int) $partido['equipo_visitante_id'];

            $estado = $data['estado'] ?? 'finalizado';
            if (!in_array($estado, ['programado', 'en_juego', 'finalizado', 'suspendido'], true)) {
                responder_error(400, 'El estado del partido no es válido');
            }
            $gl = entero_opcional($data['goles_local'] ?? 0, 0, 99);
            $gv = entero_opcional($data['goles_visitante'] ?? 0, 0, 99);
            $pl = entero_opcional($data['penales_local'] ?? null, 0, 99);
            $pv = entero_opcional($data['penales_visitante'] ?? null, 0, 99);
            if ($gl === false || $gv === false || $pl === false || $pv === false) {
                responder_error(400, 'Los goles y penales deben ser números entre 0 y 99');
            }
            $gl = $gl ?? 0;
            $gv = $gv ?? 0;

            // Regla del torneo: no hay empates. Con empate se define por penales; el ganador se
            // calcula aquí a partir del marcador (no se confía en el que mande el frontend).
            $empate = $gl === $gv;
            if (!$empate) {
                $pl = null;
                $pv = null;
            }
            $ganador = null;
            if ($estado === 'finalizado') {
                if (!$empate) {
                    $ganador = $gl > $gv ? $local : $visitante;
                } elseif ($pl === null || $pv === null || $pl === $pv) {
                    responder_error(400, 'El partido terminó empatado: captura la tanda de penales con un ganador');
                } else {
                    $ganador = $pl > $pv ? $local : $visitante;
                }
            }
            $empate_minuto_18 = ($empate && $pl !== null && $pv !== null) ? 1 : 0;

            // Validar incidencias: tipo, minuto y que la jugadora sea del equipo indicado
            $tipos = ['gol', 'autogol', 'tarjeta_amarilla', 'tarjeta_roja', 'falta'];
            $incidencias = [];
            foreach (($data['incidencias'] ?? []) as $n => $inc) {
                $num = $n + 1;
                $jugadora_id = (int) ($inc['jugadora_id'] ?? 0);
                $equipo_id = (int) ($inc['equipo_id'] ?? 0);
                $minuto = entero_opcional($inc['minuto'] ?? null, 0, 60);
                if (!in_array($inc['tipo'] ?? '', $tipos, true)) {
                    responder_error(400, "Incidencia $num: tipo no válido");
                }
                if ($equipo_id !== $local && $equipo_id !== $visitante) {
                    responder_error(400, "Incidencia $num: el equipo no juega este partido");
                }
                if ($minuto === false || $minuto === null) {
                    responder_error(400, "Incidencia $num: el minuto debe estar entre 0 y 60");
                }
                $jug = ejecutar($conn, "SELECT equipo_id FROM jugadoras WHERE id = ?", [$jugadora_id])
                    ->get_result()->fetch_assoc();
                if (!$jug || (int) $jug['equipo_id'] !== $equipo_id) {
                    responder_error(400, "Incidencia $num: la jugadora no pertenece a ese equipo");
                }
                $incidencias[] = [$partido_id, $jugadora_id, $equipo_id, $inc['tipo'], $minuto];
            }

            // Si no se envían notas, se conservan las que ya tenía el partido
            $notas = array_key_exists('notas_mesa', $data)
                ? texto_o_null($data['notas_mesa'])
                : (ejecutar($conn, "SELECT notas_mesa FROM partidos WHERE id = ?", [$partido_id])->get_result()->fetch_assoc()['notas_mesa'] ?? null);

            // El acta reemplaza por completo las incidencias anteriores: guardar dos veces no duplica
            $conn->begin_transaction();
            try {
                ejecutar($conn,
                    "UPDATE partidos
                     SET goles_local = ?, goles_visitante = ?, empate_minuto_18 = ?,
                         penales_local = ?, penales_visitante = ?, ganador_id = ?,
                         estado = ?, notas_mesa = ?
                     WHERE id = ?",
                    [$gl, $gv, $empate_minuto_18, $pl, $pv, $ganador, $estado, $notas, $partido_id]);
                ejecutar($conn, "DELETE FROM incidencias_partido WHERE partido_id = ?", [$partido_id]);
                foreach ($incidencias as $fila) {
                    ejecutar($conn,
                        "INSERT INTO incidencias_partido (partido_id, jugadora_id, equipo_id, tipo, minuto)
                         VALUES (?, ?, ?, ?, ?)", $fila);
                }
                $conn->commit();
                echo json_encode(['ok' => true, 'ganador_id' => $ganador]);
            } catch (Exception $e) {
                $conn->rollback();
                responder_error(500, 'No se pudo guardar el acta');
            }
            break;
    }

?>