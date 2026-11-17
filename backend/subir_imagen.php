<?php
    // Recibe una imagen (multipart/form-data: campo "imagen" y "tipo") y devuelve su URL pública.
    // tipo: 'escudo' | 'jugadora'. Solo JPG, PNG o WebP de hasta 3 MB.
    require_once __DIR__ . '/comun.php';
    preparar_respuesta();
    requerir_rol(['superadmin', 'capitana']);

    const TAMANO_MAXIMO = 3 * 1024 * 1024;
    const FORMATOS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    const CARPETAS = ['escudo' => 'escudos', 'jugadora' => 'jugadoras'];

    $tipo = $_POST['tipo'] ?? '';
    if (!isset(CARPETAS[$tipo])) {
        responder_error(400, 'Tipo de imagen no válido');
    }
    $archivo = $_FILES['imagen'] ?? null;
    if (!$archivo || $archivo['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($archivo['tmp_name'])) {
        responder_error(400, 'No se recibió la imagen');
    }
    if ($archivo['size'] > TAMANO_MAXIMO) {
        responder_error(400, 'La imagen supera el límite de 3 MB');
    }

    // Se revisa el contenido real del archivo, no la extensión ni lo que diga el navegador
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);
    if (!isset(FORMATOS[$mime]) || @getimagesize($archivo['tmp_name']) === false) {
        responder_error(400, 'Formato no permitido: usa JPG, PNG o WebP');
    }

    $carpeta = CARPETAS[$tipo];
    $destino_dir = __DIR__ . '/uploads/' . $carpeta;
    if (!is_dir($destino_dir) && !mkdir($destino_dir, 0775, true)) {
        responder_error(500, 'No se pudo preparar la carpeta de imágenes');
    }
    $nombre = bin2hex(random_bytes(16)) . '.' . FORMATOS[$mime];
    if (!move_uploaded_file($archivo['tmp_name'], "$destino_dir/$nombre")) {
        responder_error(500, 'No se pudo guardar la imagen');
    }

    echo json_encode(['ok' => true, 'url' => url_uploads() . "/$carpeta/$nombre"]);
?>
