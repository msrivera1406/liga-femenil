from typing import List, Dict, Any, Optional
from rapidfuzz import fuzz, process

def match_player_name(extracted_name: str, roster: List[Dict[str, Any]], threshold: float = 65.0) -> Dict[str, Any]:
    """
    Compara un nombre manuscrito extraído de la cédula contra la lista oficial
    de jugadoras del equipo usando algoritmos de similitud de cadenas.
    
    Args:
        extracted_name: Nombre leído por el OCR (ej: 'Valeria Mtz')
        roster: Lista de jugadoras del equipo [{'id': 1, 'nombre': 'Valeria Martínez', 'dorsal': 10}]
        threshold: Porcentaje mínimo de coincidencia para considerar match válido (0-100)
    """
    clean_extracted = (extracted_name or "").strip()
    if not clean_extracted or not roster:
        return {
            "matched": False,
            "id": None,
            "nombre_oficial": None,
            "dorsal_oficial": None,
            "confidence": 0.0,
            "tipo_match": "sin_datos"
        }

    # Nombres en el roster
    choices = [p.get("nombre", "") for p in roster]
    
    # Intento 1: token_sort_ratio (inmune al orden de palabras 'Martínez Valeria' vs 'Valeria Martínez')
    best_match = process.extractOne(
        clean_extracted, 
        choices, 
        scorer=fuzz.token_sort_ratio
    )
    
    # Intento 2: partial_ratio (útil para abreviaturas tipo 'V. Martínez' o 'Valeria M')
    best_partial = process.extractOne(
        clean_extracted,
        choices,
        scorer=fuzz.partial_ratio
    )

    # Elegir el mejor score con preferencia por token_sort si son cercanos
    score = 0.0
    matched_name = None
    if best_match and best_partial:
        if best_match[1] >= best_partial[1] - 5:
            score = float(best_match[1])
            matched_name = best_match[0]
        else:
            score = float(best_partial[1])
            matched_name = best_partial[0]
    elif best_match:
        score = float(best_match[1])
        matched_name = best_match[0]

    if score >= threshold and matched_name:
        # Buscar el objeto jugadora completo
        player_obj = next((p for p in roster if p.get("nombre") == matched_name), None)
        return {
            "matched": True,
            "id": player_obj.get("id") if player_obj else None,
            "nombre_oficial": matched_name,
            "dorsal_oficial": player_obj.get("dorsal") if player_obj else None,
            "confidence": round(score, 1),
            "tipo_match": "exacto" if score >= 95 else "aproximado"
        }
    
    return {
        "matched": False,
        "id": None,
        "nombre_oficial": None,
        "dorsal_oficial": None,
        "confidence": round(score, 1),
        "tipo_match": "no_encontrado"
    }

def reconcile_team_players(extracted_players: List[Dict[str, Any]], roster: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Enriquece cada jugadora de la cédula con su match correspondiente en el roster del equipo.
    """
    reconciled = []
    for p in extracted_players:
        name = p.get("nombre", "")
        match_info = match_player_name(name, roster)
        reconciled.append({
            **p,
            "match_roster": match_info
        })
    return reconciled
