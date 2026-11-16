import os
import time
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError, ClientError
from dotenv import load_dotenv

# Cargar variables de entorno automáticamente
load_dotenv()

from schemas import CedulaArbitralExtraction
from validator import validate_match_sheet
from fuzzy_matcher import reconcile_team_players

logger = logging.getLogger("cedula_scanner")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Lista de modelos en orden de prioridad y resiliencia
# Modelos ligeros de última generación con menor saturación y alta capacidad multimodal
MODELS_CASCADE = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.5-flash"
]

SYSTEM_PROMPT = """
Eres un asistente experto en digitalización y OCR de actas deportivas y cédulas arbitrales de fútbol.
Tu tarea es analizar la imagen o documento PDF de la cédula oficial de partido ("LIGA DE FÚTBOL MUJERES DIVERSAS MÉXICO").

Estructura del documento:
1. ENCABEZADO:
   - CATEGORIA: (ej: Femenil Libre, Juvenil, etc.)
   - ACTA DE PARTIDO EFECTUADO EL DIA ... DE ... DEL 202... A LAS ...
   - ARBITRO: Nombre del árbitro principal
   - A. ASISTENTE: Nombre del árbitro asistente

2. EQUIPOS Y TABLAS (Fútbol 7):
   - Columna izquierda: EQUIPO LOCAL
   - Columna derecha: EQUIPO VISITANTE
   - Ambas columnas tienen dos secciones de filas:
     a) TITULARES: Filas numeradas del 1 al 7.
     b) CAMBIOS: Filas numeradas del 1 al 3.
   - Cada fila contiene las columnas:
     * NOMBRE: Nombre y apellido de la jugadora escrito a mano o máquina.
     * T.A: Tarjetas Amarillas (número de tarjetas o marcas). Si está vacío, pon 0.
     * T.R: Tarjetas Rojas (número o marcas). Si está vacío, pon 0.
     * G: Goles anotados por esa jugadora (número o marcas de palitos). Si está vacío, pon 0.

3. PIE DE PÁGINA:
   - ( [Goles Local] ) MARCADOR FINAL ( [Goles Visitante] )
   - FIRMA DEL CAPITAN (Izquierda: Local, Derecha: Visitante). Indica True si hay firma/rúbrica legible o visible.

REGLAS DE EXTRACCIÓN:
- Si una celda de nombre está vacía o tachada sin jugadora, no la inventes; solo incluye filas con jugadoras escritas o asignadas.
- Si la caligrafía es dudosa, transcribe lo más fidedigno posible a las letras visibles.
- Lee cuidadosamente los números en las columnas T.A, T.R y Goles. Si ves marcas tipo palotes (ej. '||'), cuenta el total (2).
- Sé riguroso y responde exclusivamente con el JSON estructurado solicitado.
"""

class CedulaScannerService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY no encontrada en variables de entorno ni en constructor.")
        self.client = genai.Client(api_key=self.api_key)

    def scan_cedula(
        self, 
        file_bytes: bytes, 
        mime_type: str = "image/jpeg",
        roster_local: Optional[List[Dict[str, Any]]] = None,
        roster_visitante: Optional[List[Dict[str, Any]]] = None,
        max_retries_per_model: int = 2
    ) -> Dict[str, Any]:
        """
        Escanea una cédula arbitral con reintentos exponenciales y cascada de modelos.
        """
        part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        
        last_error = None
        attempt_details = []

        for model_name in MODELS_CASCADE:
            logger.info(f"Probando modelo: {model_name}")
            backoff_seconds = 2.0

            for attempt in range(1, max_retries_per_model + 1):
                try:
                    logger.info(f"[{model_name}] Intento {attempt}...")
                    
                    config = types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema=CedulaArbitralExtraction,
                        temperature=0.1
                    )

                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=[part, "Extrae fielmente toda la información de esta cédula de partido."],
                        config=config
                    )

                    if not response.text:
                        raise ValueError(f"El modelo {model_name} devolvió una respuesta vacía.")

                    # Parsear el JSON devuelto
                    raw_json = json.loads(response.text)
                    validated_extraction = CedulaArbitralExtraction(**raw_json).model_dump()

                    # Validaciones matemáticas y de integridad
                    validation_report = validate_match_sheet(validated_extraction)

                    # Reconciliación con listas oficiales de jugadoras (si se proporcionaron)
                    if roster_local:
                        validated_extraction["equipo_local"]["titulares"] = reconcile_team_players(
                            validated_extraction["equipo_local"]["titulares"], roster_local
                        )
                        validated_extraction["equipo_local"]["cambios"] = reconcile_team_players(
                            validated_extraction["equipo_local"]["cambios"], roster_local
                        )

                    if roster_visitante:
                        validated_extraction["equipo_visitante"]["titulares"] = reconcile_team_players(
                            validated_extraction["equipo_visitante"]["titulares"], roster_visitante
                        )
                        validated_extraction["equipo_visitante"]["cambios"] = reconcile_team_players(
                            validated_extraction["equipo_visitante"]["cambios"], roster_visitante
                        )

                    return {
                        "success": True,
                        "model_used": model_name,
                        "attempts_log": attempt_details,
                        "data": validated_extraction,
                        "validation": validation_report
                    }

                except Exception as e:
                    err_str = str(e)
                    is_overloaded_or_rate = "503" in err_str or "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "UNAVAILABLE" in err_str
                    logger.warning(f"Error en {model_name} (intento {attempt}): {err_str[:120]}")
                    
                    attempt_details.append({
                        "model": model_name,
                        "attempt": attempt,
                        "error": err_str[:150],
                        "transient": is_overloaded_or_rate
                    })
                    last_error = e

                    if is_overloaded_or_rate and attempt < max_retries_per_model:
                        logger.info(f"Modelo ocupado o límite alcanzado. Esperando {backoff_seconds}s para reintentar...")
                        time.sleep(backoff_seconds)
                        backoff_seconds *= 2.0
                    else:
                        # Si no es un error recuperable o ya se agotaron los intentos, saltar al siguiente modelo
                        break

        # Si todos los modelos de la cascada fallaron
        raise RuntimeError(f"No fue posible procesar la cédula tras probar todos los modelos de respaldo. Último error: {last_error}")
