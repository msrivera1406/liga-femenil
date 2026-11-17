<?php
    // Configuración y utilidades compartidas por los endpoints del backend.

    // Orígenes del frontend que pueden llamar a la API con cookies de sesión.
    const ORIGENES_PERMITIDOS = ['http://localhost:4200'];

    // Headers JSON y CORS. Responde de inmediato las peticiones OPTIONS (preflight).
    function preparar_respuesta() {
        header('Content-Type: application/json; charset=UTF-8');
        $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origen, ORIGENES_PERMITIDOS, true)) {
            header("Access-Control-Allow-Origin: $origen");
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
    }

    // Credenciales por variables de entorno; los valores por defecto son los de XAMPP local.
    function conectar() {
        $conn = new mysqli(
            getenv('DB_HOST') ?: 'localhost',
            getenv('DB_USER') ?: 'root',
            getenv('DB_PASS') ?: '',
            getenv('DB_NAME') ?: 'liga_femenil_db'
        );
        $conn->set_charset('utf8mb4');
        return $conn;
    }

    function leer_json() {
        $data = json_decode(file_get_contents("php://input"), true);
        return is_array($data) ? $data : [];
    }

    function responder_error($codigo_http, $mensaje) {
        http_response_code($codigo_http);
        echo json_encode(['ok' => false, 'error' => $mensaje]);
        exit();
    }

    // Sesión de PHP con cookie HttpOnly (JavaScript no puede leerla).
    function iniciar_sesion() {
        if (session_status() === PHP_SESSION_NONE) {
            session_name('LIGA_SESION');
            session_set_cookie_params([
                'lifetime' => 0,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
                'secure'   => !empty($_SERVER['HTTPS'])
            ]);
            session_start();
        }
    }

    function usuario_actual() {
        iniciar_sesion();
        return $_SESSION['usuario'] ?? null;
    }

    // Detiene la petición con 401 (sin sesión) o 403 (rol no permitido).
    function requerir_rol(array $roles) {
        $usuario = usuario_actual();
        if (!$usuario) {
            responder_error(401, 'Inicia sesión para continuar');
        }
        if (!in_array($usuario['rol'], $roles, true)) {
            responder_error(403, 'No tienes permiso para esta acción');
        }
        return $usuario;
    }
?>
