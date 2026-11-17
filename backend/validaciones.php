<?php
    // Validación y normalización de datos que se usan al crear y al editar.
    // Cada función devuelve el arreglo listo para guardar, o un texto con el error.

    const POSICIONES   = ['Portera', 'Defensa', 'Medio', 'Delantera'];
    const NIVELES      = ['Iniciación', 'Intermedio', 'Avanzado'];
    const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Desconocido'];

    // Campos de jugadora que el frontend puede enviar
    const CAMPOS_JUGADORA = [
        'equipo_id', 'nombre_deportivo', 'dorsal', 'posicion', 'nivel_experiencia', 'edad',
        'foto_url', 'autoriza_imagen', 'nombre_legal', 'telefono_contacto',
        'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 'contacto_emergencia_parentesco',
        'tipo_sangre', 'alergias_condiciones'
    ];

    function texto($valor) {
        return $valor === null ? '' : trim((string) $valor);
    }

    function texto_o_null($valor) {
        $t = texto($valor);
        return $t === '' ? null : $t;
    }

    // Entero en rango, null si viene vacío, false si es inválido
    function entero_opcional($valor, $min, $max) {
        if ($valor === null || $valor === '') {
            return null;
        }
        return filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => $min, 'max_range' => $max]]);
    }

    // Solo rutas locales (/images/...), URLs https o imágenes subidas a backend/uploads,
    // para que no se guarden esquemas peligrosos (javascript:, data:)
    function url_valida($url) {
        return $url === null || str_starts_with($url, '/') || str_starts_with($url, 'https://')
            || str_starts_with($url, url_uploads() . '/');
    }

    function normalizar_jugadora($conn, array $d, $excluir_id = 0) {
        $j = [
            'equipo_id'                      => entero_opcional($d['equipo_id'] ?? null, 1, PHP_INT_MAX),
            'nombre_deportivo'               => texto($d['nombre_deportivo'] ?? ''),
            'dorsal'                         => entero_opcional($d['dorsal'] ?? null, 1, 99),
            'posicion'                       => $d['posicion'] ?? '',
            'nivel_experiencia'              => texto_o_null($d['nivel_experiencia'] ?? null),
            'edad'                           => entero_opcional($d['edad'] ?? null, 16, 65),
            'foto_url'                       => texto_o_null($d['foto_url'] ?? null),
            'autoriza_imagen'                => empty($d['autoriza_imagen']) ? 0 : 1,
            'nombre_legal'                   => texto($d['nombre_legal'] ?? ''),
            'telefono_contacto'              => texto($d['telefono_contacto'] ?? ''),
            'contacto_emergencia_nombre'     => texto($d['contacto_emergencia_nombre'] ?? ''),
            'contacto_emergencia_telefono'   => texto($d['contacto_emergencia_telefono'] ?? ''),
            'contacto_emergencia_parentesco' => texto_o_null($d['contacto_emergencia_parentesco'] ?? null),
            'tipo_sangre'                    => texto_o_null($d['tipo_sangre'] ?? null) ?? 'Desconocido',
            'alergias_condiciones'           => texto_o_null($d['alergias_condiciones'] ?? null)
        ];

        if ($j['nombre_deportivo'] === '') return 'Falta el nombre deportivo';
        if ($j['nombre_legal'] === '') $j['nombre_legal'] = $j['nombre_deportivo'];
        if ($j['equipo_id'] === false) return 'El equipo no es válido';
        if ($j['dorsal'] === false) return 'El dorsal debe estar entre 1 y 99';
        if ($j['edad'] === false) return 'La edad debe estar entre 16 y 65 años';
        if (!in_array($j['posicion'], POSICIONES, true)) return 'La posición no es válida';
        if ($j['nivel_experiencia'] !== null && !in_array($j['nivel_experiencia'], NIVELES, true)) return 'El nivel de experiencia no es válido';
        if (!in_array($j['tipo_sangre'], TIPOS_SANGRE, true)) return 'El tipo de sangre no es válido';
        if (!url_valida($j['foto_url'])) return 'La foto debe ser una ruta local o una URL https';

        $limites = ['nombre_deportivo' => 80, 'nombre_legal' => 120, 'telefono_contacto' => 20,
                    'contacto_emergencia_nombre' => 100, 'contacto_emergencia_telefono' => 20,
                    'contacto_emergencia_parentesco' => 30, 'foto_url' => 255, 'alergias_condiciones' => 1000];
        foreach ($limites as $campo => $max) {
            if ($j[$campo] !== null && mb_strlen($j[$campo]) > $max) return "El campo $campo excede $max caracteres";
        }

        // Sin equipo = bolsa de independientes, sin dorsal
        if ($j['equipo_id'] === null) {
            $j['dorsal'] = null;
        } else {
            $stmt = $conn->prepare("SELECT id FROM equipos WHERE id = ? AND activo = 1");
            $stmt->execute([$j['equipo_id']]);
            if (!$stmt->get_result()->fetch_assoc()) return 'El equipo no existe o está dado de baja';

            if ($j['dorsal'] !== null) {
                $stmt = $conn->prepare("SELECT nombre_deportivo FROM jugadoras
                                        WHERE equipo_id = ? AND dorsal = ? AND activo = 1 AND id <> ?");
                $stmt->execute([$j['equipo_id'], $j['dorsal'], $excluir_id]);
                $otra = $stmt->get_result()->fetch_assoc();
                if ($otra) return "El dorsal {$j['dorsal']} ya lo usa {$otra['nombre_deportivo']}";
            }
        }
        $j['es_independiente'] = $j['equipo_id'] === null ? 1 : 0;
        return $j;
    }

    function normalizar_entrenador(array $d) {
        $e = [
            'nombre_completo'     => texto($d['nombre_completo'] ?? ''),
            'disciplinas'         => texto($d['disciplinas'] ?? ''),
            'zonas_cobertura'     => texto($d['zonas_cobertura'] ?? ''),
            'bio'                 => texto($d['bio'] ?? ''),
            'precio_sesion'       => filter_var($d['precio_sesion'] ?? null, FILTER_VALIDATE_FLOAT),
            'telefono_publico'    => texto($d['telefono_publico'] ?? ''),
            'disponibilidad_json' => $d['disponibilidad_json'] ?? null,
            'foto_url'            => texto_o_null($d['foto_url'] ?? null),
            'activo'              => array_key_exists('activo', $d) && empty($d['activo']) ? 0 : 1
        ];
        if ($e['nombre_completo'] === '' || $e['disciplinas'] === '' || $e['zonas_cobertura'] === '' ||
            $e['bio'] === '' || $e['telefono_publico'] === '') {
            return 'Faltan datos obligatorios del entrenador';
        }
        if ($e['precio_sesion'] === false || $e['precio_sesion'] < 0 || $e['precio_sesion'] > 99999) {
            return 'El precio por sesión no es válido';
        }
        if (!url_valida($e['foto_url'])) return 'La foto debe ser una ruta local o una URL https';
        $limites = ['nombre_completo' => 100, 'disciplinas' => 150, 'zonas_cobertura' => 200,
                    'telefono_publico' => 20, 'foto_url' => 255];
        foreach ($limites as $campo => $max) {
            if ($e[$campo] !== null && mb_strlen($e[$campo]) > $max) return "El campo $campo excede $max caracteres";
        }
        if ($e['disponibilidad_json'] !== null) {
            if (!is_array($e['disponibilidad_json'])) return 'La disponibilidad no es válida';
            $e['disponibilidad_json'] = json_encode($e['disponibilidad_json'], JSON_UNESCAPED_UNICODE);
        }
        return $e;
    }

    // Guarda o actualiza los datos médicos (tabla separada por ser datos sensibles)
    function guardar_datos_medicos($conn, $jugadora_id, $tipo_sangre, $alergias) {
        $stmt = $conn->prepare(
            "INSERT INTO jugadoras_datos_medicos (jugadora_id, tipo_sangre, alergias_condiciones)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE tipo_sangre = VALUES(tipo_sangre), alergias_condiciones = VALUES(alergias_condiciones)");
        $stmt->execute([$jugadora_id, $tipo_sangre, $alergias]);
    }
?>
