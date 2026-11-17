<?php
    // Cambia la contraseña de un usuario de la plataforma.
    // Uso (desde la terminal):
    //   /opt/lampp/bin/php database/cambiar_password.php correo@ligafemenil.mx
    // La contraseña se pide sin mostrarla en pantalla.

    if (PHP_SAPI !== 'cli') {
        http_response_code(404);
        exit();
    }

    $email = strtolower(trim($argv[1] ?? ''));
    if ($email === '') {
        fwrite(STDERR, "Uso: php cambiar_password.php correo@ligafemenil.mx\n");
        exit(1);
    }

    function leer_oculto($mensaje) {
        echo $mensaje;
        system('stty -echo');
        $valor = rtrim((string) fgets(STDIN), "\r\n");
        system('stty echo');
        echo "\n";
        return $valor;
    }

    $password = leer_oculto('Nueva contraseña: ');
    if (strlen($password) < 10) {
        fwrite(STDERR, "La contraseña debe tener al menos 10 caracteres.\n");
        exit(1);
    }
    if ($password !== leer_oculto('Repite la contraseña: ')) {
        fwrite(STDERR, "Las contraseñas no coinciden.\n");
        exit(1);
    }

    $conn = new mysqli(
        getenv('DB_HOST') ?: 'localhost',
        getenv('DB_USER') ?: 'root',
        getenv('DB_PASS') ?: '',
        getenv('DB_NAME') ?: 'liga_femenil_db'
    );
    $stmt = $conn->prepare("UPDATE usuarios SET password_hash = ? WHERE email = ?");
    $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $email]);

    if ($stmt->affected_rows === 1) {
        echo "Contraseña actualizada para $email\n";
    } else {
        fwrite(STDERR, "No existe un usuario con el correo $email\n");
        exit(1);
    }
?>
