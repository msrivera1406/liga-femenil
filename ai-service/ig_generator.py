import os
import json
import logging
import re
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from schemas import IGContentOutput

logger = logging.getLogger("ig_generator")

# Modelos disponibles en cascada de menor latencia a mayor
MODELS_CASCADE = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
]

def remove_emojis(text: str) -> str:
    """Elimina cualquier emoji o pictograma unicode para cumplir estrictamente la regla de cero emojis."""
    if not text:
        return ""
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FA6F"  # chess symbols
        "\U0001FA70-\U0001FAFF"  # symbols & pictographs ext-a
        "\U00002600-\U000026FF"  # misc symbols
        "\U00002B50"             # star
        "\U0000200D"             # zero width joiner
        "\U0000FE0F"             # variation selector
        "]+",
        flags=re.UNICODE
    )
    cleaned = emoji_pattern.sub("", text)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()

IG_SYSTEM_PROMPT = """Eres la directora de comunicaciones oficial de la Liga de Fútbol Mujeres Diversas México (4.ª Edición).
Tu tarea es redactar textos editoriales de alto impacto para publicaciones e historias (Stories) de Instagram.

REGLAS ABSOLUTAS Y OBLIGATORIAS:
1. REGLA DE ORO CRÍTICA: ESTÁ COMPLETAMENTE PROHIBIDO EL USO DE EMOJIS.
   - NO coloques emojis en el titular.
   - NO coloques emojis en el subtítulo.
   - NO coloques emojis en el cuerpo del pie de foto (caption).
   - NO coloques emojis en el dato clave ni en el llamado a la acción.
   - NO coloques emojis en los hashtags.
   - Cada texto debe ser 100% tipográfico, pulcro y profesional.
2. Identidad de la Liga:
   - Slogan oficial: "No somos una liga, somos una comunidad".
   - Valores: Respeto, inclusión, diversidad, pasión deportiva, juego limpio y empoderamiento de mujeres diversas en el deporte.
3. Tipos de Contenido:
   - 'resultados_jornada': Resumen de la fecha dominical, resultados reñidos, goleadas y ambiente en cancha.
   - 'partido_destacado': Previa o resumen del choque más parejo y vibrante de la fecha.
   - 'tabla_posiciones': Foco en el liderato general, la lucha por los puestos de liguilla y la regularidad de los clubes.
   - 'goleadora_jornada' (Story 9:16): Reconocimiento individual para la delantera que lideró el goleo dominical. Ensalza su puntería, dorsal y equipo.
   - 'portera_segura' (Story 9:16): Reconocimiento individual para la portera con valla invicta o actuaciones monumentales bajo los tres postes.
4. Tono:
   - 'emocionante': Énfasis en adrenalina, dinamismo, remontadas y entrega en cada minuto.
   - 'comunitario': Énfasis en compañerismo, orgullo, espacio seguro y vivencia colectiva.
   - 'institucional': Preciso, estadístico, formal y conmemorativo.
5. Estructura del Caption:
   - Gancho inicial claro e impactante (sin emojis).
   - Cuerpo narrativo bien redactado con párrafos breves.
   - Conclusión o llamado de convocatoria a la afición.
   - Bloque final de 4 a 6 hashtags oficiales limpios (ej: #LigaMujeresDiversas #FutbolFemenil #OrgulloYPasión #4taEdicion #ComunidadSegura).
6. LONGITUD EXACTA PARA LA LÁMINA GRÁFICA:
   - 'titular': MÁXIMO 6 PALABRAS. Debe ser contundente como titular de periódico deportivo (ej: 'PASIÓN Y HERMANDAD EN CANCHA').
   - 'subtitulo': MÁXIMO 7 PALABRAS. Breve y directo (ej: 'Gran empate entre All Stars y TBD').
   - 'dato_clave': MÁXIMO 8 PALABRAS. Sintético y puntual (ej: 'Empate 2-2 con gol agónico al 48'). NUNCA escribas párrafos largos en dato_clave porque se saldrán del marco.
"""

class IGContentGenerator:
    """Generador de textos, copys y láminas para Instagram con Gemini y esquema libre de emojis."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Cliente de Gemini inicializado correctamente en IGContentGenerator.")
            except Exception as e:
                logger.error(f"Error inicializando genai.Client en IGContentGenerator: {e}")
        else:
            logger.warning("GEMINI_API_KEY no detectada. IGContentGenerator funcionará en modo de respaldo.")

    def generate_content(
        self,
        tipo_contenido: str = "resultados_jornada",
        formato: str = "feed_4_5",
        tono: str = "emocionante",
        jornada_numero: int = 1,
        fecha: str = "Domingo 4 de Octubre de 2026",
        datos_partidos: Optional[List[Dict[str, Any]]] = None,
        tabla_posiciones: Optional[List[Dict[str, Any]]] = None,
        jugadora_destacada: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera el contenido editorial para Instagram utilizando Gemini con fallback determinista.
        """
        datos_partidos = datos_partidos or []
        tabla_posiciones = tabla_posiciones or []
        jugadora_destacada = jugadora_destacada or {}

        # Construir prompt detallado
        prompt_parts = [
            f"Tipo de contenido solicitado: {tipo_contenido}",
            f"Formato visual destino: {formato} (ej: {'Historia vertical 9:16' if formato == 'story_9_16' else 'Publicación de Feed'})",
            f"Tono editorial requerido: {tono}",
            f"Jornada: {jornada_numero} | Fecha oficial: {fecha}",
            ""
        ]

        if tipo_contenido == "resultados_jornada" or tipo_contenido == "partido_destacado":
            prompt_parts.append("Resultados oficiales de los partidos de esta jornada:")
            for p in datos_partidos:
                loc = p.get("equipo_local", "Local")
                vis = p.get("equipo_visitante", "Visitante")
                g_loc = p.get("goles_local", 0)
                g_vis = p.get("goles_visitante", 0)
                cancha = p.get("cancha", "Cancha 1")
                horario = p.get("horario", "09:00")
                goleadores = p.get("goleadores", "")
                prompt_parts.append(f"- {loc} {g_loc} - {g_vis} {vis} | Horario: {horario} | {cancha} {f'| Goles: {goleadores}' if goleadores else ''}")
        
        elif tipo_contenido == "tabla_posiciones":
            prompt_parts.append("Tabla general de posiciones oficial (Top clubes):")
            for pos in tabla_posiciones[:6]:
                pos_num = pos.get("posicion", 1)
                eq = pos.get("equipo", "Club")
                pts = pos.get("puntos", 0)
                dg = pos.get("diferencia_goles", 0)
                pj = pos.get("partidos_jugados", 0)
                prompt_parts.append(f"{pos_num}. {eq}: {pts} pts (PJ: {pj}, DG: {dg})")

        elif tipo_contenido in ("goleadora_jornada", "portera_segura"):
            prompt_parts.append(f"Información de la jugadora destacada ({tipo_contenido}):")
            prompt_parts.append(f"- Nombre: {jugadora_destacada.get('nombre', 'Jugadora')}")
            prompt_parts.append(f"- Equipo: {jugadora_destacada.get('equipo', 'Club')}")
            prompt_parts.append(f"- Dorsal: #{jugadora_destacada.get('dorsal', 'S/D')}")
            prompt_parts.append(f"- Logro en la jornada: {jugadora_destacada.get('logro', 'Actuación destacada')}")
            if jugadora_destacada.get("estadistica"):
                prompt_parts.append(f"- Cifra oficial: {jugadora_destacada.get('estadistica')}")

        prompt_parts.append("")
        prompt_parts.append("RECUERDA: NO USES NINGÚN EMOJI en ninguna parte del JSON de salida.")
        full_user_prompt = "\n".join(prompt_parts)

        # 1. Intentar con Gemini
        if self.client:
            from google.genai import types
            for model_name in MODELS_CASCADE:
                try:
                    logger.info(f"[IG Generator] Solicitando contenido con modelo: {model_name}")
                    config = types.GenerateContentConfig(
                        system_instruction=IG_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        response_schema=IGContentOutput,
                        temperature=0.4
                    )
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=[full_user_prompt],
                        config=config
                    )
                    if response.text:
                        raw_data = json.loads(response.text)
                        clean_data = self._clean_and_sanitize(raw_data)
                        logger.info(f"[IG Generator] Generación exitosa con {model_name} para {tipo_contenido}")
                        return {
                            "success": True,
                            "model_used": model_name,
                            "data": clean_data
                        }
                except Exception as e:
                    logger.warning(f"[IG Generator] Error con modelo {model_name}: {e}")

        # 2. Modo Fallback inteligente (Sin conexión o error de Gemini)
        logger.info("[IG Generator] Usando fallback determinista de redacción.")
        fallback_data = self._generate_fallback(
            tipo_contenido=tipo_contenido,
            tono=tono,
            jornada_numero=jornada_numero,
            fecha=fecha,
            datos_partidos=datos_partidos,
            tabla_posiciones=tabla_posiciones,
            jugadora_destacada=jugadora_destacada
        )
        return {
            "success": True,
            "model_used": "deterministic-fallback",
            "data": fallback_data
        }

    def _clean_and_sanitize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Asegura que absolutamente ningún emoji permanezca en la respuesta generada."""
        titular = remove_emojis(raw.get("titular", ""))
        subtitulo = remove_emojis(raw.get("subtitulo", ""))
        caption = remove_emojis(raw.get("caption", ""))
        dato_clave = remove_emojis(raw.get("dato_clave", ""))
        llamado_accion = remove_emojis(raw.get("llamado_accion", ""))
        raw_hashtags = raw.get("hashtags", [])
        clean_hashtags = [remove_emojis(h).strip() for h in raw_hashtags if remove_emojis(h).strip()]

        return {
            "titular": titular,
            "subtitulo": subtitulo,
            "caption": caption,
            "dato_clave": dato_clave,
            "llamado_accion": llamado_accion,
            "hashtags": clean_hashtags
        }

    def _generate_fallback(
        self,
        tipo_contenido: str,
        tono: str,
        jornada_numero: int,
        fecha: str,
        datos_partidos: List[Dict[str, Any]],
        tabla_posiciones: List[Dict[str, Any]],
        jugadora_destacada: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Plantillas editoriales redactadas sin emojis para contingencia."""
        if tipo_contenido == "goleadora_jornada":
            nombre = jugadora_destacada.get("nombre", "Figura de la Fecha")
            equipo = jugadora_destacada.get("equipo", "Club Destacado")
            dorsal = jugadora_destacada.get("dorsal", "10")
            goles = jugadora_destacada.get("estadistica", "Goleadora oficial")
            
            titular = f"Goleadora de la Jornada {jornada_numero}"
            subtitulo = f"{nombre} (# {dorsal}) de {equipo}"
            caption = (
                f"Potencia, colocación y efectividad frente al marco rival.\n\n"
                f"Reconocemos el extraordinario desempeño de {nombre}, portadora del dorsal {dorsal} "
                f"en {equipo}, quien brilló como la máxima anotadora de la Jornada {jornada_numero}.\n\n"
                f"Su liderazgo en el ataque y definición marcaron la diferencia en una fecha dominical "
                f"cargada de intensidad deportiva y compañerismo en nuestras canchas.\n\n"
                f"En la Liga de Fútbol Mujeres Diversas celebramos el talento, el esfuerzo colectivo "
                f"y el poderío deportivo de cada jugadora."
            )
            dato_clave = f"{goles} en la fecha dominical para impulsar a su escuadra."
            llamado = "Sigue la cobertura completa y la tabla general de goleo en nuestra plataforma oficial."
            hashtags = ["#GoleadoraDeLaJornada", "#LigaMujeresDiversas", "#FutbolFemenil", "#PoderEnLaCancha", "#4taEdicion"]

        elif tipo_contenido == "portera_segura":
            nombre = jugadora_destacada.get("nombre", "Guardameta Imbatible")
            equipo = jugadora_destacada.get("equipo", "Club Destacado")
            dorsal = jugadora_destacada.get("dorsal", "1")
            record = jugadora_destacada.get("estadistica", "Valla imbatida con intervenciones decisivas")

            titular = f"Seguridad Bajo los Tres Postes"
            subtitulo = f"{nombre} (# {dorsal}) de {equipo}"
            caption = (
                f"Determinación, reflejos y temple en los momentos de mayor presión.\n\n"
                f"La portera destacada de la Jornada {jornada_numero} es {nombre} (#{dorsal}) de {equipo}, "
                f"pieza angular para mantener el orden defensivo de su conjunto y garantizar la suma de puntos.\n\n"
                f"Su voz de mando, valentía en el mano a mano y seguridad aérea demostraron una vez más "
                f"que la solidez en el arco se construye con disciplina y concentración absoluta.\n\n"
                f"No somos una liga, somos una comunidad que aplaude el talento y la entrega de nuestras arqueras."
            )
            dato_clave = f"{record} a lo largo del compromiso dominical."
            llamado = "Reconoce su esfuerzo en los comentarios y consulta el reporte de incidencias en nuestra web."
            hashtags = ["#PorteraDeLaJornada", "#VallaInvicta", "#LigaMujeresDiversas", "#ArquerasConGarra", "#ComunidadSegura"]

        elif tipo_contenido == "partido_destacado":
            partido = datos_partidos[0] if datos_partidos else {}
            loc = partido.get("equipo_local", "Local")
            vis = partido.get("equipo_visitante", "Visitante")
            g_loc = partido.get("goles_local", 0)
            g_vis = partido.get("goles_visitante", 0)

            titular = f"El Duelo de la Fecha {jornada_numero}"
            subtitulo = f"{loc} {g_loc} vs {g_vis} {vis}"
            caption = (
                f"Noventa minutos de máxima exigencia, entrega táctica y pasión sobre el césped.\n\n"
                f"El enfrentamiento entre {loc} y {vis} brindó uno de los pasajes más disputados de la Jornada {jornada_numero}. "
                f"Ambos planteles mostraron personalidad, juego asociativo y un enorme respeto por el deporte.\n\n"
                f"El marcador final de {g_loc} a {g_vis} refleja la paridad y el compromiso de cada jugadora en la cancha.\n\n"
                f"Gracias a las dos escuadras por regalarnos una cátedra de juego limpio y emoción genuina."
            )
            dato_clave = f"Choque estelar de la fecha con pizarra final {g_loc} - {g_vis}."
            llamado = "Revive las incidencias completas y la galería oficial en el portal de la liga."
            hashtags = ["#PartidoDeLaSemana", "#LigaMujeresDiversas", "#FutbolFemenil", "#PasionYComunidad", "#4taEdicion"]

        elif tipo_contenido == "tabla_posiciones":
            titular = f"Tabla General - Jornada {jornada_numero}"
            subtitulo = "La lucha por los puestos de liguilla se intensifica"
            caption = (
                f"Disputada la Jornada {jornada_numero}, la tabla de posiciones refleja el alto nivel competitivo "
                f"de la 4.ª Edición de la Liga de Fútbol Mujeres Diversas México.\n\n"
                f"Cada punto disputado los domingos cuenta para afianzarse en la parte alta y aspirar a la fase final. "
                f"Felicitamos a los clubes líderes por su regularidad y a todos los equipos por mantener vivas sus aspiraciones con garra y deportividad.\n\n"
                f"No somos una liga, somos una comunidad unida por el amor a la pelota y el respeto mutuo."
            )
            dato_clave = "Zona de clasificación al rojo vivo con diferencias mínimas en el puntaje."
            llamado = "Consulta la tabla completa con estadísticas de goles y tarjetas en nuestro portal oficial."
            hashtags = ["#TablaDePosiciones", "#LigaMujeresDiversas", "#FutbolFemenil", "#RumboALaLiguilla", "#ComunidadDiversa"]

        else: # resultados_jornada
            titular = f"Resultados Oficiales - Jornada {jornada_numero}"
            subtitulo = f"Cierre de la jornada dominical del {fecha}"
            caption = (
                f"Concluida la actividad de la Jornada {jornada_numero} de la 4.ª Edición de la Liga de Fútbol Mujeres Diversas México.\n\n"
                f"Fue un domingo repleto de intensidad, juego colectivo de alto nivel y el gran ambiente fraterno que caracteriza a nuestras canchas. "
                f"Reconocemos el esfuerzo de los 12 clubes participantes, sus cuerpos técnicos y la afición que acompañó cada encuentro.\n\n"
                f"Compartimos la lámina oficial con los marcadores registrados en la mesa de control arbitral.\n\n"
                f"No somos una liga, somos una comunidad."
            )
            dato_clave = "Jornada dominical completa con 6 cotejos disputados en tiempo y forma."
            llamado = "Desliza para ver la lámina completa y comenta el partido que más te apasionó este fin de semana."
            hashtags = ["#ResultadosOficiales", "#LigaMujeresDiversas", "#FutbolFemenil", "#ComunidadSegura", "#4taEdicion"]

        return {
            "titular": titular,
            "subtitulo": subtitulo,
            "caption": caption,
            "dato_clave": dato_clave,
            "llamado_accion": llamado,
            "hashtags": hashtags
        }
