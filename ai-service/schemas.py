import os
from typing import List, Optional
from pydantic import BaseModel, Field

class JugadoraFila(BaseModel):
    fila: int = Field(description="Número de fila (1 a 7 para titulares, 1 a 3 para cambios)")
    dorsal: Optional[str] = Field(default="", description="Número de camiseta o dorsal si está visible")
    nombre: str = Field(description="Nombre y/o apellidos de la jugadora tal como está escrito")
    ta: int = Field(default=0, description="Tarjetas amarillas (T.A)")
    tr: int = Field(default=0, description="Tarjetas rojas (T.R)")
    goles: int = Field(default=0, description="Goles anotados (G)")

class EquipoCedula(BaseModel):
    nombre: str = Field(description="Nombre del equipo tal como está escrito en el encabezado de la columna")
    titulares: List[JugadoraFila] = Field(default_factory=list, description="Jugadoras titulares (filas 1 al 7)")
    cambios: List[JugadoraFila] = Field(default_factory=list, description="Jugadoras de cambio / suplentes (filas 1 al 3)")

class MarcadorFinal(BaseModel):
    local: int = Field(default=0, description="Goles del equipo local indicados en el marcador final")
    visitante: int = Field(default=0, description="Goles del equipo visitante indicados en el marcador final")

class CedulaArbitralExtraction(BaseModel):
    categoria: str = Field(default="", description="Categoría indicada en la parte superior")
    fecha: str = Field(default="", description="Fecha del partido (día, mes, año)")
    hora: str = Field(default="", description="Hora del partido")
    arbitro: str = Field(default="", description="Nombre del árbitro principal")
    asistente: str = Field(default="", description="Nombre del árbitro asistente")
    equipo_local: EquipoCedula = Field(description="Datos del equipo local (columna izquierda)")
    equipo_visitante: EquipoCedula = Field(description="Datos del equipo visitante (columna derecha)")
    marcador_final: MarcadorFinal = Field(description="Marcador final indicado entre paréntesis en la parte inferior")
    firma_capitan_local: bool = Field(default=False, description="True si hay firma o rúbrica en 'FIRMA DEL CAPITAN' local")
    firma_capitan_visitante: bool = Field(default=False, description="True si hay firma o rúbrica en 'FIRMA DEL CAPITAN' visitante")
    observaciones: str = Field(default="", description="Anotaciones extra, incidentes o notas legibles al margen")

class VoiceIncidentExtraction(BaseModel):
    tipo: str = Field(description="Tipo de incidencia: 'gol', 'tarjeta_amarilla', 'tarjeta_roja', 'sustitucion', 'falta' o 'desconocido'")
    equipo_mencionado: Optional[str] = Field(default=None, description="Nombre o fragmento del equipo mencionado en el audio")
    dorsal: Optional[int] = Field(default=None, description="Número de camiseta o dorsal si fue mencionado")
    jugadora_nombre: Optional[str] = Field(default=None, description="Nombre o apellido de la jugadora si fue mencionado")
    minuto: Optional[int] = Field(default=None, description="Minuto del partido si fue mencionado (ej: 18)")
    jugadora_entra: Optional[str] = Field(default=None, description="En sustituciones, jugadora que entra")
    dorsal_entra: Optional[int] = Field(default=None, description="En sustituciones, dorsal que entra")
    jugadora_sale: Optional[str] = Field(default=None, description="En sustituciones, jugadora que sale")
    dorsal_sale: Optional[int] = Field(default=None, description="En sustituciones, dorsal que sale")
    tipo_gol: Optional[str] = Field(default="jugada", description="'jugada', 'tiro_libre', 'penal' o 'autogol'")
    detalle: Optional[str] = Field(default=None, description="Detalles adicionales mencionados como 'falta táctica', 'tiro de fuera de área', etc.")
    resumen: str = Field(default="", description="Breve descripción legible de la incidencia detectada")
    es_incidencia_valida: bool = Field(default=True, description="True ÚNICAMENTE si lo dicho corresponde a una acción del partido (gol, tarjeta, sustitución, falta). Pon False si el audio es ruido, conversación casual, preguntas generales (como matemáticas, chistes, etc.) o algo ajeno al fútbol.")

class IGContentOutput(BaseModel):
    titular: str = Field(description="Titular de impacto para la pieza de Instagram (máximo 6 palabras, contundente y conciso). ESTRICTAMENTE SIN EMOJIS.")
    subtitulo: str = Field(description="Subtítulo o bajada descriptiva breve (máximo 7 palabras). ESTRICTAMENTE SIN EMOJIS.")
    caption: str = Field(description="Texto completo para el pie de foto de Instagram con gancho, desarrollo narrativo y llamado a la afición. ESTRICTAMENTE SIN EMOJIS.")
    dato_clave: str = Field(description="Dato estadístico, récord o highlight ultra conciso para la lámina (máximo 8 palabras, ej: 'Empate 2-2 con remontada vibrante'). ESTRICTAMENTE SIN EMOJIS.")
    llamado_accion: str = Field(description="Frase de cierre o convocatoria a la comunidad. ESTRICTAMENTE SIN EMOJIS.")
    hashtags: List[str] = Field(default_factory=list, description="Lista de hashtags oficiales en texto plano. ESTRICTAMENTE SIN EMOJIS.")


