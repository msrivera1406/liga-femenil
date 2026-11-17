<?php
    require_once __DIR__ . '/comun.php';
    preparar_respuesta();

    $data = leer_json();
    if (empty($data['filtro'])) {
        responder_error(400, 'Falta el filtro de la petición');
    }

    // Hash de una contraseña aleatoria: se usa cuando el correo no existe para que
    // la respuesta tarde lo mismo y no revele qué correos están registrados.
    const HASH_SENUELO = '$2y$10$KT3wEMi4UY.wQEnlDjz5eO4mHRuOXtw9gLImY2icF9zHZtVzfJ.O.';

    switch ($data['filtro']) {

        case 'login':
            $email    = strtolower(trim((string) ($data['email'] ?? '')));
            $password = (string) ($data['password'] ?? '');
            if ($email === '' || $password === '') {
                responder_error(400, 'Ingresa tu correo y contraseña');
            }

            $conn = conectar();
            $stmt = $conn->prepare(
                "SELECT u.id, u.email, u.password_hash, u.rol, u.nombre_contacto,
                        e.id AS equipo_id, e.nombre AS equipo_nombre
                 FROM usuarios u
                 LEFT JOIN equipos e ON e.capitana_id = u.id
                 WHERE u.email = ?
                 LIMIT 1");
            $stmt->execute([$email]);
            $fila = $stmt->get_result()->fetch_assoc();

            $valida = password_verify($password, $fila['password_hash'] ?? HASH_SENUELO);
            if (!$fila || !$valida) {
                sleep(1); // frena intentos repetidos
                responder_error(401, 'Correo o contraseña incorrectos');
            }

            iniciar_sesion();
            session_regenerate_id(true); // evita fijación de sesión
            $_SESSION['usuario'] = [
                'id'              => (int) $fila['id'],
                'email'           => $fila['email'],
                'rol'             => $fila['rol'],
                'nombre_contacto' => $fila['nombre_contacto'],
                'equipo_id'       => $fila['equipo_id'] !== null ? (int) $fila['equipo_id'] : null,
                'equipo_nombre'   => $fila['equipo_nombre']
            ];
            echo json_encode(['ok' => true, 'usuario' => $_SESSION['usuario']]);
            break;

        case 'sesion':
            // usuario es null si no hay sesión iniciada
            echo json_encode(['ok' => true, 'usuario' => usuario_actual()]);
            break;

        case 'logout':
            iniciar_sesion();
            $_SESSION = [];
            $p = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires'  => time() - 3600,
                'path'     => $p['path'],
                'httponly' => true,
                'samesite' => 'Lax',
                'secure'   => $p['secure']
            ]);
            session_destroy();
            echo json_encode(['ok' => true]);
            break;

        default:
            responder_error(400, 'Filtro no válido');
    }
?>
