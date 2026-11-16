<?php
/**
 * API Endpoint: Publicaciones Oficiales de Instagram
 * Liga de Fútbol Mujeres Diversas México
 *
 * Flujo de actualización automática:
 * 1. La aplicación web consulta este endpoint (/api/instagram/posts.php).
 * 2. El servidor revisa una caché local (cache/instagram_posts.json) para evitar límites de tasa (rate limits) de Meta.
 * 3. Si la caché tiene menos de 1 hora (3600 segundos), la devuelve en < 5ms.
 * 4. Si la caché venció, consulta la API oficial de Meta Graph (Instagram Basic Display / Graph API).
 * 5. Guarda la respuesta en caché y la sirve al frontend.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$cacheDir = __DIR__ . '/../../cache';
$cacheFile = $cacheDir . '/instagram_posts.json';
$cacheDurationSeconds = 3600; // 1 hora de caché

// 1. Verificar si existe caché válida
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheDurationSeconds)) {
    $cachedData = file_get_contents($cacheFile);
    if (!empty($cachedData)) {
        echo $cachedData;
        exit();
    }
}

// 2. Parámetros de Meta Graph API (Instagram for Creators / Business)
// En producción, estos valores se configuran en variables de entorno o archivo de configuración
$accessToken = getenv('INSTAGRAM_ACCESS_TOKEN') ?: 'YOUR_LONG_LIVED_ACCESS_TOKEN';
$fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';
$limit = 6;

$apiUrl = "https://graph.instagram.com/me/media?fields={$fields}&limit={$limit}&access_token={$accessToken}";

// 3. Si el token no está configurado aún o estamos en local sin credenciales Meta, devolver datos por defecto
if ($accessToken === 'YOUR_LONG_LIVED_ACCESS_TOKEN') {
    $fallbackPosts = [
        [
            'id' => 'DesjjWkgMbX',
            'caption' => '💜⚽🏳️‍🌈 ¡LE DAMOS LA BIENVENIDA A TBD UNITED! 🏳️‍🌈⚽ ¡Un nuevo equipo se suma a la familia de la 4.ª Edición de la Liga de Fútbol Mujeres Diversas México! 🔥🙌 Recuerden que aquí todas tienen un lugar: somos un espacio seguro. 🌈 No somos una liga, somos una comunidad.',
            'media_type' => 'IMAGE',
            'media_url' => '/images/instagram/DesjjWkgMbX.jpg',
            'permalink' => 'https://www.instagram.com/p/DesjjWkgMbX/',
            'timestamp' => '2026-10-19T18:00:00Z',
            'likes_count' => 38,
            'comments_count' => 1
        ],
        [
            'id' => 'DdmVaftm4vC',
            'caption' => '(2) ¡Momentos de la clausura de la 3a edición de la Liga Mujeres Diversas! Fue un éxito rotundo 🏆🩷💜 Gracias infinitas a cada una de las personas que fueron parte de este episodio. ⚽️🥅 ¡No somos una liga, somos una comunidad! 🫶🏼',
            'media_type' => 'CAROUSEL_ALBUM',
            'media_url' => '/images/instagram/DdmVaftm4vC.jpg',
            'permalink' => 'https://www.instagram.com/p/DdmVaftm4vC/',
            'timestamp' => '2026-09-22T19:30:00Z',
            'likes_count' => 25,
            'comments_count' => 0
        ],
        [
            'id' => 'DdkF37_h0qI',
            'caption' => '¡Si te perdiste la Gran Final de la 3a Edición, aquí puedes revivir cada momento y jugada! ⚽🙌🏼🥅🏆 1º y 2º Lugar con toda la pasión, talento y orgullo en la cancha.',
            'media_type' => 'IMAGE',
            'media_url' => '/images/instagram/DdkF37_h0qI.jpg',
            'permalink' => 'https://www.instagram.com/p/DdkF37_h0qI/',
            'timestamp' => '2026-09-21T17:15:00Z',
            'likes_count' => 18,
            'comments_count' => 0
        ],
        [
            'id' => 'DdibSmRnK0v',
            'caption' => '2° Lugar del 2° Torneo de la Liga Mujeres Diversas 🥳 🐦‍🔥 Fénix FC ❤️‍🔥 Cucuuuuuu 👊🏻😎 ¡Celebrando el esfuerzo y la unión del equipo!',
            'media_type' => 'IMAGE',
            'media_url' => '/images/instagram/DdibSmRnK0v.jpg',
            'permalink' => 'https://www.instagram.com/p/DdibSmRnK0v/',
            'timestamp' => '2026-09-20T21:00:00Z',
            'likes_count' => 53,
            'comments_count' => 0
        ],
        [
            'id' => 'DdgrtFtR4eL',
            'caption' => '🏆⚽ ¡HOY ES EL DÍA! 💜 Muchísimo éxito a cada escuadra que disputará el 1er, 2º y 3er lugar de la 3ª edición de Liga Mujeres Diversas. 🫶🏽✨ El equipo que gane hoy, ganamos todas. ¡No somos una liga, somos una comunidad!',
            'media_type' => 'IMAGE',
            'media_url' => '/images/instagram/DdgrtFtR4eL.jpg',
            'permalink' => 'https://www.instagram.com/p/DdgrtFtR4eL/',
            'timestamp' => '2026-09-20T14:30:00Z',
            'likes_count' => 4,
            'comments_count' => 0
        ],
        [
            'id' => 'DYUam03g-Fs',
            'caption' => '🌈⚽ GOOD VIBES 💙 vs FFFC 🩷 Un partido donde la intensidad, el respeto y el orgullo se hicieron presentes en cada jugada. 🔥 Construimos comunidad, visibilidad y espacios seguros. 💬 “Diversas en la cancha, imparables en la vida.”',
            'media_type' => 'CAROUSEL_ALBUM',
            'media_url' => '/images/instagram/DYUam03g-Fs.jpg',
            'permalink' => 'https://www.instagram.com/p/DYUam03g-Fs/',
            'timestamp' => '2026-05-14T20:00:00Z',
            'likes_count' => 23,
            'comments_count' => 2
        ]
    ];

    $response = json_encode([
        'status' => 'success',
        'data' => $fallbackPosts,
        'cached' => false,
        'source' => 'default_posts'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    echo $response;
    exit();
}

// 4. Conexión con Meta Graph API mediante cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($result)) {
    $graphData = json_decode($result, true);
    $normalizedPosts = [];

    if (isset($graphData['data']) && is_array($graphData['data'])) {
        foreach ($graphData['data'] as $item) {
            $normalizedPosts[] = [
                'id' => $item['id'] ?? '',
                'caption' => $item['caption'] ?? '',
                'media_type' => $item['media_type'] ?? 'IMAGE',
                'media_url' => ($item['media_type'] === 'VIDEO' && isset($item['thumbnail_url'])) ? $item['thumbnail_url'] : ($item['media_url'] ?? ''),
                'permalink' => $item['permalink'] ?? 'https://www.instagram.com',
                'timestamp' => $item['timestamp'] ?? gmdate('c'),
                'likes_count' => $item['like_count'] ?? 0,
                'comments_count' => $item['comments_count'] ?? 0
            ];
        }
    }

    $finalPayload = json_encode([
        'status' => 'success',
        'data' => $normalizedPosts,
        'cached' => true,
        'timestamp' => time()
    ], JSON_UNESCAPED_UNICODE);

    // Guardar en caché si el directorio existe o se puede crear
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    @file_put_contents($cacheFile, $finalPayload);

    echo $finalPayload;
    exit();
}

// 5. En caso de fallo con Meta, si hay caché vieja la usamos como salvavidas
if (file_exists($cacheFile)) {
    echo file_get_contents($cacheFile);
    exit();
}

// Si nada funciona, responder error controlado
http_response_code(500);
echo json_encode([
    'status' => 'error',
    'message' => 'No fue posible sincronizar publicaciones de Instagram.'
]);
