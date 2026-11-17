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

    function buscar($conn, $sql, $params) {
        return ejecutar($conn, $sql, $params)->get_result()->fetch_assoc();
    }

    // Una capitana solo puede tocar jugadoras activas de su propio equipo
    function verificar_jugadora_de_capitana($conn, $usuario, $jugadora_id) {
        if ($usuario['rol'] !== 'capitana') return;
        $actual = buscar($conn, "SELECT equipo_id FROM jugadoras WHERE id = ? AND activo = 1", [$jugadora_id]);
        if (!$actual || (int) $actual['equipo_id'] !== (int) $usuario['equipo_id']) {
            responder_error(403, 'Solo puedes editar jugadoras de tu equipo');
        }
    }

    switch ($data['filtro']) {

        // Los cambios se combinan con lo guardado: los campos que no se envían no se pierden
        case 'equipo':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            $id = (int) ($data['id'] ?? 0);
            if ($usuario['rol'] === 'capitana' && $id !== (int) $usuario['equipo_id']) {
                responder_error(403, 'Solo puedes editar tu propio equipo');
            }
            $actual = buscar($conn, "SELECT nombre, escudo_url, video_url, capitana_id FROM equipos WHERE id = ? AND activo = 1", [$id]);
            if (!$actual) {
                responder_error(404, 'El equipo no existe');
            }
            $nombre = array_key_exists('nombre', $data) ? texto($data['nombre']) : $actual['nombre'];
            $escudo = array_key_exists('escudo_url', $data) ? texto_o_null($data['escudo_url']) : $actual['escudo_url'];
            $video  = array_key_exists('video_url', $data) ? texto_o_null($data['video_url']) : $actual['video_url'];
            // Solo la Directora reasigna la capitanía
            $capitana = ($usuario['rol'] === 'superadmin' && array_key_exists('capitana_id', $data))
                ? entero_opcional($data['capitana_id'], 1, PHP_INT_MAX)
                : $actual['capitana_id'];

            if ($nombre === '' || mb_strlen($nombre) > 80) {
                responder_error(400, 'El nombre del equipo es obligatorio (máximo 80 caracteres)');
            }
            if ($capitana === false) {
                responder_error(400, 'La capitana no es válida');
            }
            if (!url_valida($escudo) || !url_valida($video)) {
                responder_error(400, 'El escudo y el video deben ser rutas locales o URLs https');
            }
            if (buscar($conn, "SELECT id FROM equipos WHERE nombre = ? AND id <> ?", [$nombre, $id])) {
                responder_error(400, 'Ya existe otro equipo con ese nombre');
            }
            ejecutar($conn,
                "UPDATE equipos SET nombre = ?, escudo_url = ?, video_url = ?, capitana_id = ? WHERE id = ?",
                [$nombre, $escudo, $video, $capitana, $id]);
            echo json_encode(['ok' => true]);
            break;

        case 'baja_equipo':
            requerir_rol(['superadmin']);
            // Baja lógica: el equipo conserva su historial de partidos
            ejecutar($conn, "UPDATE equipos SET activo = 0 WHERE id = ?", [(int) ($data['id'] ?? 0)]);
            echo json_encode(['ok' => true]);
            break;

        // Edita la ficha completa, incluidos los datos médicos. También sirve para
        // asignar a un equipo (equipo_id + dorsal) o mandar a la bolsa (equipo_id = null).
        case 'jugadora':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            $id = (int) ($data['id'] ?? 0);
            verificar_jugadora_de_capitana($conn, $usuario, $id);

            $actual = buscar($conn,
                "SELECT j.*, m.tipo_sangre, m.alergias_condiciones
                 FROM jugadoras j LEFT JOIN jugadoras_datos_medicos m ON m.jugadora_id = j.id
                 WHERE j.id = ? AND j.activo = 1", [$id]);
            if (!$actual) {
                responder_error(404, 'La jugadora no existe');
            }
            $cambios = array_intersect_key($data, array_flip(CAMPOS_JUGADORA));
            if ($usuario['rol'] === 'capitana') {
                unset($cambios['equipo_id']); // no puede moverla a otro equipo
            }
            $j = normalizar_jugadora($conn, array_merge($actual, $cambios), $id);
            if (is_string($j)) {
                responder_error(400, $j);
            }

            $conn->begin_transaction();
            try {
                ejecutar($conn,
                    "UPDATE jugadoras
                     SET equipo_id = ?, nombre_deportivo = ?, dorsal = ?, posicion = ?, nivel_experiencia = ?,
                         edad = ?, foto_url = ?, autoriza_imagen = ?, nombre_legal = ?, telefono_contacto = ?,
                         contacto_emergencia_nombre = ?, contacto_emergencia_telefono = ?,
                         contacto_emergencia_parentesco = ?, es_independiente = ?
                     WHERE id = ?",
                    [$j['equipo_id'], $j['nombre_deportivo'], $j['dorsal'], $j['posicion'], $j['nivel_experiencia'],
                     $j['edad'], $j['foto_url'], $j['autoriza_imagen'], $j['nombre_legal'], $j['telefono_contacto'],
                     $j['contacto_emergencia_nombre'], $j['contacto_emergencia_telefono'],
                     $j['contacto_emergencia_parentesco'], $j['es_independiente'], $id]);
                guardar_datos_medicos($conn, $id, $j['tipo_sangre'], $j['alergias_condiciones']);
                $conn->commit();
                echo json_encode(['ok' => true]);
            } catch (Exception $e) {
                $conn->rollback();
                responder_error(500, 'No se pudo actualizar a la jugadora');
            }
            break;

        case 'baja_jugadora':
            $usuario = requerir_rol(['superadmin', 'capitana']);
            $id = (int) ($data['id'] ?? 0);
            verificar_jugadora_de_capitana($conn, $usuario, $id);
            // Baja lógica: se conservan sus goles y tarjetas en las actas
            ejecutar($conn, "UPDATE jugadoras SET activo = 0 WHERE id = ?", [$id]);
            echo json_encode(['ok' => true]);
            break;

        case 'entrenador':
            requerir_rol(['superadmin']);
            $id = (int) ($data['id'] ?? 0);
            $actual = buscar($conn, "SELECT * FROM entrenadores WHERE id = ?", [$id]);
            if (!$actual) {
                responder_error(404, 'El entrenador no existe');
            }
            $actual['disponibilidad_json'] = json_decode((string) $actual['disponibilidad_json'], true);
            $e = normalizar_entrenador(array_merge($actual, $data));
            if (is_string($e)) {
                responder_error(400, $e);
            }
            ejecutar($conn,
                "UPDATE entrenadores
                 SET nombre_completo = ?, disciplinas = ?, zonas_cobertura = ?, bio = ?, precio_sesion = ?,
                     telefono_publico = ?, disponibilidad_json = ?, foto_url = ?, activo = ?
                 WHERE id = ?",
                [$e['nombre_completo'], $e['disciplinas'], $e['zonas_cobertura'], $e['bio'], $e['precio_sesion'],
                 $e['telefono_publico'], $e['disponibilidad_json'], $e['foto_url'], $e['activo'], $id]);
            echo json_encode(['ok' => true]);
            break;

        case 'entrenador_estado':
            requerir_rol(['superadmin']);
            ejecutar($conn, "UPDATE entrenadores SET activo = ? WHERE id = ?",
                [empty($data['activo']) ? 0 : 1, (int) ($data['id'] ?? 0)]);
            echo json_encode(['ok' => true]);
            break;

        case 'baja_entrenador':
            requerir_rol(['superadmin']);
            ejecutar($conn, "DELETE FROM entrenadores WHERE id = ?", [(int) ($data['id'] ?? 0)]);
            echo json_encode(['ok' => true]);
            break;

        // Fecha de la jornada y, por partido: horario, cancha, localía y suspensión.
        // Los partidos ya jugados o en juego no se reprograman.
        case 'calendario':
            requerir_rol(['superadmin']);
            $jornada_id = (int) ($data['jornada_id'] ?? 0);
            if (!buscar($conn, "SELECT id FROM jornadas WHERE id = ?", [$jornada_id])) {
                responder_error(404, 'La jornada no existe');
            }
            $fecha = DateTime::createFromFormat('Y-m-d', (string) ($data['fecha_domingo'] ?? ''));
            if (!$fecha || $fecha->format('Y-m-d') !== $data['fecha_domingo']) {
                responder_error(400, 'La fecha debe tener formato AAAA-MM-DD');
            }

            $cambios = [];
            foreach (($data['partidos'] ?? []) as $p) {
                $actual = buscar($conn,
                    "SELECT id, equipo_local_id, equipo_visitante_id, estado FROM partidos WHERE id = ? AND jornada_id = ?",
                    [(int) ($p['id'] ?? 0), $jornada_id]);
                if (!$actual) {
                    responder_error(400, 'Hay un partido que no pertenece a esta jornada');
                }
                if (in_array($actual['estado'], ['finalizado', 'en_juego'], true)) {
                    continue; // ya jugado: se deja como está
                }
                $horario = substr((string) ($p['horario'] ?? ''), 0, 5);
                if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $horario)) {
                    responder_error(400, 'Horario no válido: usa HH:MM');
                }
                $local = (int) ($p['equipo_local_id'] ?? 0);
                $visitante = (int) ($p['equipo_visitante_id'] ?? 0);
                $mismos = [$local, $visitante];
                $originales = [(int) $actual['equipo_local_id'], (int) $actual['equipo_visitante_id']];
                sort($mismos);
                sort($originales);
                if ($mismos !== $originales) {
                    responder_error(400, 'Solo se puede intercambiar la localía, no los rivales');
                }
                $estado = ($p['estado'] ?? '') === 'suspendido' ? 'suspendido' : 'programado';
                $cancha = texto($p['cancha'] ?? 'Cancha 1');
                if ($cancha === '' || mb_strlen($cancha) > 50) {
                    responder_error(400, 'La cancha no es válida');
                }
                $cambios[] = [$horario . ':00', $cancha, $local, $visitante, $estado, (int) $actual['id']];
            }

            $conn->begin_transaction();
            try {
                ejecutar($conn, "UPDATE jornadas SET fecha_domingo = ? WHERE id = ?", [$data['fecha_domingo'], $jornada_id]);
                foreach ($cambios as $fila) {
                    ejecutar($conn,
                        "UPDATE partidos SET horario = ?, cancha = ?, equipo_local_id = ?, equipo_visitante_id = ?, estado = ?
                         WHERE id = ?", $fila);
                }
                $conn->commit();
                echo json_encode(['ok' => true]);
            } catch (Exception $e) {
                $conn->rollback();
                responder_error(500, 'No se pudo guardar el calendario');
            }
            break;

        default:
            responder_error(400, 'Filtro no válido');
    }
?>
