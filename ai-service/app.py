import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

from scanner_service import CedulaScannerService, MODELS_CASCADE
from voice_parser import VoiceIncidentParser
from ig_generator import IGContentGenerator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("flask_app")

app = Flask(__name__)
# Permitir peticiones desde el frontend en localhost:4200 y cualquier origen local
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Instanciar servicios de IA
scanner = CedulaScannerService()
voice_parser = VoiceIncidentParser()
ig_generator = IGContentGenerator()

@app.route("/api/health", methods=["GET"])
def health():
    """Endpoint de comprobación de salud y configuración"""
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return jsonify({
        "status": "healthy",
        "service": "ai-cedula-scanner",
        "gemini_api_configured": has_key,
        "models_cascade": MODELS_CASCADE
    }), 200

@app.route("/api/cedula/scan", methods=["POST"])
def scan_cedula_endpoint():
    """
    Endpoint principal para escanear y procesar la cédula física del árbitro.
    Espera un archivo multipart ('file' o 'image') y opcionalmente 'roster_local' y 'roster_visitante'.
    """
    file = request.files.get("file") or request.files.get("image")
    if not file:
        return jsonify({
            "success": False,
            "error": "No se proporcionó ningún archivo. Debe adjuntarse en el campo 'file' o 'image'."
        }), 400

    filename = file.filename or "cedula.jpg"
    mime_type = file.mimetype or "image/jpeg"
    
    # Normalizar MIME types comunes
    if filename.lower().endswith(".pdf"):
        mime_type = "application/pdf"
    elif filename.lower().endswith(".png"):
        mime_type = "image/png"
    elif filename.lower().endswith((".jpg", ".jpeg")):
        mime_type = "image/jpeg"

    # Leer bytes del archivo
    file_bytes = file.read()
    if not file_bytes:
        return jsonify({
            "success": False,
            "error": "El archivo adjuntado está vacío."
        }), 400

    # Parsear rosters opcionales para fuzzy matching
    roster_local = None
    roster_visitante = None
    
    raw_roster_local = request.form.get("roster_local")
    if raw_roster_local:
        try:
            roster_local = json.loads(raw_roster_local)
        except Exception as e:
            logger.warning(f"No se pudo parsear roster_local JSON: {e}")

    raw_roster_visitante = request.form.get("roster_visitante")
    if raw_roster_visitante:
        try:
            roster_visitante = json.loads(raw_roster_visitante)
        except Exception as e:
            logger.warning(f"No se pudo parsear roster_visitante JSON: {e}")

    logger.info(f"Recibida petición de escaneo: {filename} ({len(file_bytes)} bytes, MIME: {mime_type})")

    try:
        resultado = scanner.scan_cedula(
            file_bytes=file_bytes,
            mime_type=mime_type,
            roster_local=roster_local,
            roster_visitante=roster_visitante
        )
        return jsonify(resultado), 200

    except Exception as e:
        logger.error(f"Error procesando cédula: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/voice/parse-incident", methods=["POST"])
def parse_voice_incident_endpoint():
    """
    Endpoint para interpretar comandos y notas de voz de mesa de control en vivo.
    Espera un JSON con:
    - 'text' o 'transcript' (cadena de audio transcrita)
    - 'equipo_local' (objeto con id, nombre y roster opcional)
    - 'equipo_visitante' (objeto con id, nombre y roster opcional)
    - 'minuto_actual' (entero, por defecto 20)
    """
    payload = request.get_json(silent=True) or {}
    text = payload.get("text") or payload.get("transcript") or request.form.get("text") or ""
    
    if not text.strip():
        return jsonify({
            "success": False,
            "error": "No se recibió texto de transcripción de voz para procesar."
        }), 400

    equipo_local = payload.get("equipo_local")
    equipo_visitante = payload.get("equipo_visitante")
    minuto_actual = payload.get("minuto_actual", 20)
    try:
        minuto_actual = int(minuto_actual)
    except (ValueError, TypeError):
        minuto_actual = 20

    logger.info(f"Petición de NLU de voz: '{text}' (Min: {minuto_actual})")

    try:
        resultado = voice_parser.parse_transcript(
            transcript=text,
            equipo_local=equipo_local,
            equipo_visitante=equipo_visitante,
            minuto_actual=minuto_actual
        )
        return jsonify(resultado), 200
    except Exception as e:
        logger.error(f"Error interpretando nota de voz: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/voice/process-audio", methods=["POST"])
def process_audio_endpoint():
    """
    Endpoint para procesar directamente un archivo de audio grabado en el navegador
    con Gemini Multimodal Audio.
    Espera multipart/form-data con:
    - 'audio' o 'file': archivo de audio (ej: audio/webm, audio/ogg, audio/wav)
    - 'equipo_local': JSON string con id, nombre y roster
    - 'equipo_visitante': JSON string con id, nombre y roster
    - 'minuto_actual': entero (por defecto 20)
    """
    file = request.files.get("audio") or request.files.get("file")
    if not file:
        return jsonify({
            "success": False,
            "error": "No se recibió archivo de audio en la petición."
        }), 400

    audio_bytes = file.read()
    if not audio_bytes:
        return jsonify({
            "success": False,
            "error": "El archivo de audio está vacío."
        }), 400

    mime_type = file.mimetype or "audio/webm"
    
    # Parsear contexto del partido
    equipo_local = None
    equipo_visitante = None
    
    raw_loc = request.form.get("equipo_local")
    if raw_loc:
        try:
            equipo_local = json.loads(raw_loc)
        except Exception as e:
            logger.warning(f"Error parseando equipo_local: {e}")

    raw_vis = request.form.get("equipo_visitante")
    if raw_vis:
        try:
            equipo_visitante = json.loads(raw_vis)
        except Exception as e:
            logger.warning(f"Error parseando equipo_visitante: {e}")

    minuto_actual = request.form.get("minuto_actual", 20)
    try:
        minuto_actual = int(minuto_actual)
    except (ValueError, TypeError):
        minuto_actual = 20

    logger.info(f"Petición de audio multimodal: {len(audio_bytes)} bytes ({mime_type})")

    try:
        resultado = voice_parser.parse_audio(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            equipo_local=equipo_local,
            equipo_visitante=equipo_visitante,
            minuto_actual=minuto_actual
        )
        return jsonify(resultado), 200
    except Exception as e:
        logger.error(f"Error procesando audio con Gemini: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/ig/generate-content", methods=["POST"])
def generate_ig_content_endpoint():
    """
    Endpoint para redactar contenido, copys editoriales y piezas para Instagram con IA.
    Espera un JSON con:
    - 'tipo_contenido': 'resultados_jornada', 'partido_destacado', 'tabla_posiciones', 'goleadora_jornada', 'portera_segura'
    - 'formato': 'feed_4_5', 'cuadrado_1_1', 'story_9_16'
    - 'tono': 'emocionante', 'comunitario', 'institucional'
    - 'jornada_numero': int (ej: 1)
    - 'fecha': str
    - 'datos_partidos': list
    - 'tabla_posiciones': list
    - 'jugadora_destacada': dict
    """
    payload = request.get_json(silent=True) or {}
    tipo_contenido = payload.get("tipo_contenido", "resultados_jornada")
    formato = payload.get("formato", "feed_4_5")
    tono = payload.get("tono", "emocionante")
    jornada_numero = payload.get("jornada_numero", 1)
    fecha = payload.get("fecha", "Domingo 4 de Octubre de 2026")
    datos_partidos = payload.get("datos_partidos", [])
    tabla_posiciones = payload.get("tabla_posiciones", [])
    jugadora_destacada = payload.get("jugadora_destacada", {})

    logger.info(f"[IG API] Solicitud de contenido: {tipo_contenido} ({formato}, tono: {tono}) para Jornada {jornada_numero}")

    try:
        resultado = ig_generator.generate_content(
            tipo_contenido=tipo_contenido,
            formato=formato,
            tono=tono,
            jornada_numero=jornada_numero,
            fecha=fecha,
            datos_partidos=datos_partidos,
            tabla_posiciones=tabla_posiciones,
            jugadora_destacada=jugadora_destacada
        )
        return jsonify(resultado), 200
    except Exception as e:
        logger.error(f"[IG API] Error generando contenido para Instagram: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Iniciando AI Service (Flask) en puerto {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
