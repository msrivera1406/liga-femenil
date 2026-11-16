from typing import Dict, Any, List

def validate_match_sheet(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ejecuta validaciones matemáticas y de integridad sobre los datos
    extraídos de la cédula del árbitro.
    """
    warnings: List[str] = []
    
    local_data = data.get("equipo_local", {})
    visitante_data = data.get("equipo_visitante", {})
    marcador = data.get("marcador_final", {})

    # 1. Suma de goles de jugadoras locales
    titulares_local = local_data.get("titulares", [])
    cambios_local = local_data.get("cambios", [])
    goles_calculados_local = sum(int(p.get("goles", 0) or 0) for p in (titulares_local + cambios_local))
    goles_marcador_local = int(marcador.get("local", 0) or 0)

    # 2. Suma de goles de jugadoras visitantes
    titulares_vis = visitante_data.get("titulares", [])
    cambios_vis = visitante_data.get("cambios", [])
    goles_calculados_vis = sum(int(p.get("goles", 0) or 0) for p in (titulares_vis + cambios_vis))
    goles_marcador_vis = int(marcador.get("visitante", 0) or 0)

    # Verificar coincidencia matemática en local
    local_goals_match = (goles_calculados_local == goles_marcador_local)
    if not local_goals_match:
        warnings.append(
            f"Discrepancia en Equipo Local ({local_data.get('nombre', 'Local')}): "
            f"La suma de goles en la lista de jugadoras ({goles_calculados_local}) "
            f"no coincide con el marcador final registrado ({goles_marcador_local})."
        )

    # Verificar coincidencia matemática en visitante
    visitante_goals_match = (goles_calculados_vis == goles_marcador_vis)
    if not visitante_goals_match:
        warnings.append(
            f"Discrepancia en Equipo Visitante ({visitante_data.get('nombre', 'Visitante')}): "
            f"La suma de goles en la lista de jugadoras ({goles_calculados_vis}) "
            f"no coincide con el marcador final registrado ({goles_marcador_vis})."
        )

    # 3. Validar firmas de capitanes
    firma_local = data.get("firma_capitan_local", False)
    firma_vis = data.get("firma_capitan_visitante", False)
    if not firma_local:
        warnings.append("Falta la firma del capitán del equipo local en la cédula física.")
    if not firma_vis:
        warnings.append("Falta la firma del capitán del equipo visitante en la cédula física.")

    # 4. Validar sanciones disciplinarias (doble amarilla)
    for p in (titulares_local + cambios_local):
        if int(p.get("ta", 0) or 0) >= 2 and int(p.get("tr", 0) or 0) == 0:
            warnings.append(
                f"Jugadora {p.get('nombre', 'S/N')} (Local) tiene 2 tarjetas amarillas "
                f"pero no tiene registrada tarjeta roja por expulsión."
            )

    for p in (titulares_vis + cambios_vis):
        if int(p.get("ta", 0) or 0) >= 2 and int(p.get("tr", 0) or 0) == 0:
            warnings.append(
                f"Jugadora {p.get('nombre', 'S/N')} (Visitante) tiene 2 tarjetas amarillas "
                f"pero no tiene registrada tarjeta roja por expulsión."
            )

    is_math_valid = local_goals_match and visitante_goals_match

    return {
        "is_math_valid": is_math_valid,
        "local_goals_match": local_goals_match,
        "visitante_goals_match": visitante_goals_match,
        "goles_calculados": {
            "local": goles_calculados_local,
            "visitante": goles_calculados_vis
        },
        "goles_marcador": {
            "local": goles_marcador_local,
            "visitante": goles_marcador_vis
        },
        "firmas_completas": bool(firma_local and firma_vis),
        "warnings": warnings,
        "total_jugadoras_local": len(titulares_local) + len(cambios_local),
        "total_jugadoras_visitante": len(titulares_vis) + len(cambios_vis)
    }
