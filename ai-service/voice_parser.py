import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from rapidfuzz import fuzz, process

load_dotenv()

from schemas import VoiceIncidentExtraction
from fuzzy_matcher import match_player_name

logger = logging.getLogger("voice_parser")

MODELS_CASCADE = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.5-flash"
]

VOICE_SYSTEM_PROMPT = """
Eres un árbitro y anotador de mesa de control de fútbol 7 femenil ("LIGA DE FÚTBOL MUJERES DIVERSAS MÉXICO").
Tu tarea es interpretar audios y transcripciones dictadas en vivo por la operadora de mesa durante un partido.
La operadora dictará eventos del juego como goles, tarjetas amarillas, tarjetas rojas, sustituciones (cambios) y faltas.

REGLA CRÍTICA DE RELEVANCIA:
Si el audio o texto NO TIENE NADA QUE VER con el partido de fútbol (por ejemplo: preguntas generales, matemáticas como "resuelve la integral de x²", chistes, conversaciones cotidianas, comentarios de clima, ruidos o saludos):
- Debes establecer estrictamente:
  * es_incidencia_valida = false
  * tipo = "desconocido"
  * equipo_mencionado = null
  * dorsal = null
  * jugadora_nombre = null
  * minuto = null
  * resumen = "Contenido fuera de contexto deportivo: [lo que se escuchó]"
- NUNCA inventes un gol ni asignes un equipo si el audio no menciona una acción deportiva real.

Si el audio SÍ corresponde a una acción del partido:
- es_incidencia_valida = true
- tipo: 'gol', 'tarjeta_amarilla', 'tarjeta_roja', 'sustitucion' o 'falta'.
- equipo_mencionado: Nombre o apodo del club (ej. 'Queer Goals', 'Valquirias', 'Real Madrid', 'Lionesses', 'local', 'visitante').
- dorsal: Número de camiseta de la jugadora si fue dicho (entero).
- jugadora_nombre: Nombre o apellido de la jugadora si fue dicho.
- minuto: Minuto del partido (ej. 15, 33). Si no se dice expresamente, usa null o el minuto actual de contexto.
- tipo_gol: 'jugada', 'tiro_libre', 'penal' o 'autogol' (si es gol).
- jugadora_entra / dorsal_entra / jugadora_sale / dorsal_sale: En caso de cambios/sustituciones.
- resumen: Frase corta y clara de la acción deportiva (ej. 'Gol de Queer Goals anotado por dorsal 7 al min 18').

Responde estrictamente con el JSON estructurado solicitado.
"""

class VoiceIncidentParser:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def parse_audio(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/webm",
        equipo_local: Optional[Dict[str, Any]] = None,
        equipo_visitante: Optional[Dict[str, Any]] = None,
        minuto_actual: int = 20
    ) -> Dict[str, Any]:
        """
        Escucha directamente los bytes de audio grabados por el micrófono en el navegador,
        transcribe el contenido y extrae la incidencia deportiva con Gemini Multimodal Audio.
        """
        if not audio_bytes:
            raise ValueError("No se recibieron datos de audio para procesar.")

        clean_mime = mime_type.split(";")[0].strip()
        if not clean_mime or clean_mime == "application/octet-stream":
            clean_mime = "audio/webm"

        loc_nombre = equipo_local.get("nombre", "Local") if equipo_local else "Local"
        vis_nombre = equipo_visitante.get("nombre", "Visitante") if equipo_visitante else "Visitante"

        logger.info(f"Procesando audio multimodal: {len(audio_bytes)} bytes ({clean_mime})")

        part = types.Part.from_bytes(data=audio_bytes, mime_type=clean_mime)
        prompt = f"""
Escucha atentamente este audio grabado en vivo desde la mesa de control de un partido de fútbol 7.
Contexto del partido:
- Equipo Local: {loc_nombre}
- Equipo Visitante: {vis_nombre}
- Minuto actual de mesa: {minuto_actual}

Tu tarea:
1. Escucha lo que dice la operadora de mesa en español (ej. goles, amonestaciones, expulsiones, sustituciones).
2. Extrae estrictamente la información estructurada solicitada en el esquema.
3. En el campo 'resumen', incluye una descripción fiel y legible de lo dictado.
"""

        extraction: Optional[VoiceIncidentExtraction] = None
        model_used = None

        if not self.client:
            raise ValueError("GEMINI_API_KEY no configurada para procesar audio multimodal.")

        for model_name in MODELS_CASCADE:
            try:
                logger.info(f"[Audio Multimodal] Probando modelo: {model_name}")
                config = types.GenerateContentConfig(
                    system_instruction=VOICE_SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=VoiceIncidentExtraction,
                    temperature=0.1
                )

                response = self.client.models.generate_content(
                    model=model_name,
                    contents=[part, prompt],
                    config=config
                )

                if response.text:
                    raw_data = json.loads(response.text)
                    extraction = VoiceIncidentExtraction(**raw_data)
                    model_used = model_name
                    logger.info(f"[Audio Multimodal] Procesado exitoso con {model_name}: {extraction.tipo}")
                    break
            except Exception as e:
                logger.warning(f"[Audio Multimodal] Error en modelo {model_name}: {e}")

        if not extraction:
            raise RuntimeError("No se pudo interpretar el audio dictado con los modelos de Gemini.")

        # Reconciliar con el partido y planteles oficiales
        result = self._reconcile_with_match(
            extraction=extraction,
            equipo_local=equipo_local,
            equipo_visitante=equipo_visitante,
            minuto_actual=minuto_actual
        )

        return {
            "success": True,
            "model_used": model_used,
            "raw_transcript": extraction.resumen or "Audio procesado con IA",
            "data": result
        }

    def parse_transcript(
        self,
        transcript: str,
        equipo_local: Optional[Dict[str, Any]] = None,
        equipo_visitante: Optional[Dict[str, Any]] = None,
        minuto_actual: int = 20
    ) -> Dict[str, Any]:
        """
        Interpreta la transcripción de voz usando Gemini NLU con fallback por reglas y
        emparejamiento con el roster oficial de jugadoras de ambos equipos.
        """
        clean_text = (transcript or "").strip()
        if not clean_text:
            raise ValueError("La transcripción de voz está vacía.")

        logger.info(f"Interpretando audio transcrito: '{clean_text}'")

        extraction: Optional[VoiceIncidentExtraction] = None
        model_used = "rule_based_fallback"

        # 1. Intentar con Gemini si la API key está presente
        if self.client:
            for model_name in MODELS_CASCADE:
                try:
                    logger.info(f"[Voice NLU] Intentando modelo: {model_name}")
                    prompt = f"""
Partido en curso:
- Equipo Local: {equipo_local.get('nombre', 'Local') if equipo_local else 'Local'}
- Equipo Visitante: {equipo_visitante.get('nombre', 'Visitante') if equipo_visitante else 'Visitante'}
- Minuto actual de mesa: {minuto_actual}

Transcripción de audio a interpretar:
"{clean_text}"
"""
                    config = types.GenerateContentConfig(
                        system_instruction=VOICE_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema=VoiceIncidentExtraction,
                        temperature=0.1
                    )

                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=[prompt],
                        config=config
                    )

                    if response.text:
                        raw_data = json.loads(response.text)
                        extraction = VoiceIncidentExtraction(**raw_data)
                        model_used = model_name
                        logger.info(f"[Voice NLU] Extracción exitosa con {model_name}: {extraction.tipo}")
                        break
                except Exception as e:
                    logger.warning(f"[Voice NLU] Falló modelo {model_name}: {e}")

        # 2. Si no se obtuvo con Gemini, aplicar parser por reglas y expresiones regulares
        if not extraction:
            extraction = self._rule_based_parse(clean_text, minuto_actual)
            model_used = "regex_rule_engine"

        # 3. Conciliar equipo ('local' vs 'visitante') y jugadora del roster oficial
        result = self._reconcile_with_match(
            extraction=extraction,
            equipo_local=equipo_local,
            equipo_visitante=equipo_visitante,
            minuto_actual=minuto_actual
        )

        return {
            "success": True,
            "model_used": model_used,
            "raw_transcript": clean_text,
            "data": result
        }

    def _rule_based_parse(self, text: str, default_minute: int) -> VoiceIncidentExtraction:
        """Motor de respaldo por reglas y regex en español"""
        t = text.lower()
        
        # Determinar tipo
        tipo = "desconocido"
        if "gol" in t or "anotó" in t or "anotacion" in t or "anotación" in t:
            tipo = "gol"
        elif "roja" in t or "expulsada" in t or "expulsion" in t:
            tipo = "tarjeta_roja"
        elif "amarilla" in t or "amonestada" in t or "preventiva" in t:
            tipo = "tarjeta_amarilla"
        elif "cambio" in t or "sustitucion" in t or "entra" in t:
            tipo = "sustitucion"
        elif "falta" in t or "tiro libre" in t:
            tipo = "falta"

        # Minuto
        min_match = re.search(r"minuto\s*(\d{1,2})", t)
        minuto = int(min_match.group(1)) if min_match else default_minute

        # Dorsal
        dorsal_match = re.search(r"(?:dorsal|número|numero|no\.?|#)\s*(\d{1,2})", t)
        dorsal = int(dorsal_match.group(1)) if dorsal_match else None

        # Tipo de gol
        tipo_gol = "jugada"
        if "penal" in t:
            tipo_gol = "penal"
        elif "tiro libre" in t:
            tipo_gol = "tiro_libre"
        elif "autogol" in t or "en contra" in t:
            tipo_gol = "autogol"

        is_valid = tipo != "desconocido"

        return VoiceIncidentExtraction(
            tipo=tipo,
            equipo_mencionado=None,
            dorsal=dorsal if is_valid else None,
            jugadora_nombre=None,
            minuto=minuto if is_valid else None,
            tipo_gol=tipo_gol if tipo == "gol" else None,
            detalle="Extraído mediante motor de reglas de mesa" if is_valid else "Audio fuera de contexto",
            resumen=f"Incidencia {tipo} detectada" if is_valid else "Audio descartado: no se identificó evento deportivo",
            es_incidencia_valida=is_valid
        )

    def _reconcile_with_match(
        self,
        extraction: VoiceIncidentExtraction,
        equipo_local: Optional[Dict[str, Any]],
        equipo_visitante: Optional[Dict[str, Any]],
        minuto_actual: int
    ) -> Dict[str, Any]:
        """Empareja los datos extraídos con el contexto del partido activo"""
        # 1. VERIFICACIÓN DE RELEVANCIA
        # Si el audio es irrelevante, ruido o 'desconocido', descartar inmediatamente sin crear incidencias ni goles
        is_valid = getattr(extraction, "es_incidencia_valida", True)
        if not is_valid or extraction.tipo in ("desconocido", None, "", "otro", "ninguno"):
            logger.info(f"Audio descartado por no ser acción deportiva: '{extraction.resumen}'")
            return {
                "valido": False,
                "tipo": "desconocido",
                "equipo": None,
                "equipo_nombre": None,
                "equipo_id": None,
                "minuto": None,
                "dorsal": None,
                "jugadora_id": None,
                "jugadora": None,
                "tipo_gol": None,
                "detalle": extraction.detalle or "Audio fuera de contexto deportivo",
                "resumen": extraction.resumen or "Audio descartado: no corresponde a una acción del partido.",
                "mensaje": "Audio descartado: No se detectó ninguna acción de fútbol válida (goles, tarjetas, cambios o faltas).",
                "confianza": 0.0
            }

        loc_nombre = equipo_local.get("nombre", "Local") if equipo_local else "Local"
        vis_nombre = equipo_visitante.get("nombre", "Visitante") if equipo_visitante else "Visitante"
        loc_roster = equipo_local.get("roster", []) if equipo_local else []
        vis_roster = equipo_visitante.get("roster", []) if equipo_visitante else []

        # Determinar equipo
        target_side: Optional[str] = None
        target_team_name: Optional[str] = None
        target_team_id: Optional[int] = None
        target_roster: List[Dict[str, Any]] = []

        mencionado = (extraction.equipo_mencionado or "").lower()

        # Palabras clave directas
        if "local" in mencionado or "casa" in mencionado:
            target_side = "local"
        elif "visitante" in mencionado or "visita" in mencionado:
            target_side = "visitante"
        elif mencionado:
            score_loc = fuzz.partial_ratio(mencionado, loc_nombre.lower())
            score_vis = fuzz.partial_ratio(mencionado, vis_nombre.lower())
            if score_loc > score_vis and score_loc >= 55:
                target_side = "local"
            elif score_vis >= 55:
                target_side = "visitante"

        # Si aún no se detectó el equipo, buscar en los dorsales/nombres de ambos rosters
        if not target_side and extraction.dorsal is not None:
            in_loc = any(str(p.get("dorsal")) == str(extraction.dorsal) for p in loc_roster)
            in_vis = any(str(p.get("dorsal")) == str(extraction.dorsal) for p in vis_roster)
            if in_loc and not in_vis:
                target_side = "local"
            elif in_vis and not in_loc:
                target_side = "visitante"

        # Asignar equipo definitivo (o fallback al local si no se pudo determinar)
        if target_side == "visitante":
            target_team_name = vis_nombre
            target_team_id = equipo_visitante.get("id") if equipo_visitante else None
            target_roster = vis_roster
        else:
            target_side = "local"
            target_team_name = loc_nombre
            target_team_id = equipo_local.get("id") if equipo_local else None
            target_roster = loc_roster

        # Buscar jugadora en el roster
        matched_player_id = None
        matched_player_name = extraction.jugadora_nombre
        matched_dorsal = extraction.dorsal

        # 1. Búsqueda por dorsal exacto
        if extraction.dorsal is not None and target_roster:
            found_by_dorsal = next(
                (p for p in target_roster if str(p.get("dorsal")) == str(extraction.dorsal)), 
                None
            )
            if found_by_dorsal:
                matched_player_id = found_by_dorsal.get("id")
                matched_player_name = (
                    found_by_dorsal.get("nombre_deportivo") or 
                    found_by_dorsal.get("nombre") or 
                    found_by_dorsal.get("nombre_legal") or 
                    matched_player_name
                )
                matched_dorsal = found_by_dorsal.get("dorsal")

        # 2. Búsqueda por nombre fuzzy si no hubo dorsal o se quiere validar
        if not matched_player_id and extraction.jugadora_nombre and target_roster:
            match_res = match_player_name(extraction.jugadora_nombre, target_roster, threshold=60.0)
            if match_res.get("matched"):
                matched_player_id = match_res.get("id")
                matched_player_name = match_res.get("nombre_oficial")
                if match_res.get("dorsal_oficial") is not None:
                    matched_dorsal = match_res.get("dorsal_oficial")

        # Fallback de nombre si no hay match
        if not matched_player_name:
            if matched_dorsal is not None:
                matched_player_name = f"Jugadora #{matched_dorsal}"
            else:
                matched_player_name = "Jugadora sin identificar"

        minuto_final = extraction.minuto if extraction.minuto and 0 < extraction.minuto <= 50 else minuto_actual

        # Generar texto de resumen amigable
        texto_resumen = ""
        if extraction.tipo == "gol":
            tipo_label = f" ({extraction.tipo_gol})" if extraction.tipo_gol and extraction.tipo_gol != "jugada" else ""
            texto_resumen = f"Gol de {target_team_name}{tipo_label} anotado por {matched_player_name} (#{matched_dorsal or 'S/D'}) al minuto {minuto_final}'"
        elif extraction.tipo == "tarjeta_amarilla":
            texto_resumen = f"Tarjeta amarilla para {matched_player_name} (#{matched_dorsal or 'S/D'}) de {target_team_name} al minuto {minuto_final}'"
        elif extraction.tipo == "tarjeta_roja":
            texto_resumen = f"Tarjeta roja para {matched_player_name} (#{matched_dorsal or 'S/D'}) de {target_team_name} al minuto {minuto_final}'"
        elif extraction.tipo == "sustitucion":
            texto_resumen = f"Cambio en {target_team_name}: Entra #{extraction.dorsal_entra or 'S/D'} {extraction.jugadora_entra or ''} | Sale #{extraction.dorsal_sale or 'S/D'} {extraction.jugadora_sale or ''} (min {minuto_final}')"
        else:
            texto_resumen = f"{extraction.resumen or extraction.tipo} en {target_team_name} (min {minuto_final}')"

        return {
            "valido": True,
            "tipo": extraction.tipo,
            "equipo": target_side,
            "equipo_nombre": target_team_name,
            "equipo_id": target_team_id,
            "minuto": minuto_final,
            "dorsal": matched_dorsal,
            "jugadora_id": matched_player_id,
            "jugadora": matched_player_name,
            "tipo_gol": extraction.tipo_gol or "jugada",
            "detalle": extraction.detalle or "Registrado por dictado de voz (IA)",
            "jugadora_entra": extraction.jugadora_entra,
            "dorsal_entra": extraction.dorsal_entra,
            "jugadora_sale": extraction.jugadora_sale,
            "dorsal_sale": extraction.dorsal_sale,
            "resumen": texto_resumen,
            "confianza": 0.95 if extraction.tipo != "desconocido" else 0.70
        }
