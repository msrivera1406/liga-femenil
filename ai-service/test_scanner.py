import json
import os
from dotenv import load_dotenv

load_dotenv()

from scanner_service import CedulaScannerService

def test_real_cedula_pdf():
    pdf_path = "/home/stefano/.gemini/antigravity-ide/brain/f5d7a870-a635-4091-8465-d38cb2d8722d/.user_uploaded/media_1794442806373.pdf"
    if not os.path.exists(pdf_path):
        print(f"Archivo no encontrado: {pdf_path}")
        return

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print(f"Leídos {len(pdf_bytes)} bytes de la cédula PDF.")
    
    # Roster simulado de jugadoras registradas en base de datos para probar fuzzy matching
    mock_roster_local = [
        {"id": 101, "nombre": "Laura Sánchez", "dorsal": 9},
        {"id": 102, "nombre": "Valeria Martínez", "dorsal": 10},
        {"id": 103, "nombre": "Gabriela Flores", "dorsal": 7},
        {"id": 104, "nombre": "María Morales", "dorsal": 1},
        {"id": 105, "nombre": "Ana Paola Ruiz", "dorsal": 4},
        {"id": 106, "nombre": "Sofía Herrera", "dorsal": 8},
        {"id": 107, "nombre": "Camila Domínguez", "dorsal": 11}
    ]

    mock_roster_visitante = [
        {"id": 201, "nombre": "Diana Vázquez", "dorsal": 10},
        {"id": 202, "nombre": "Fernanda López", "dorsal": 7},
        {"id": 203, "nombre": "Patricia Castro", "dorsal": 5},
        {"id": 204, "nombre": "Daniela Ortíz", "dorsal": 1},
        {"id": 205, "nombre": "Lucía Morales", "dorsal": 3},
        {"id": 206, "nombre": "Elena Ramos", "dorsal": 8},
        {"id": 207, "nombre": "Regina Silva", "dorsal": 11}
    ]

    scanner = CedulaScannerService()
    print("Iniciando escaneo con Gemini...")
    resultado = scanner.scan_cedula(
        file_bytes=pdf_bytes,
        mime_type="application/pdf",
        roster_local=mock_roster_local,
        roster_visitante=mock_roster_visitante
    )

    print("\n--- RESULTADO DE ESCANEO EXITOSO ---")
    print(f"Modelo usado: {resultado['model_used']}")
    print(f"Categoría: {resultado['data']['categoria']}")
    print(f"Equipo Local: {resultado['data']['equipo_local']['nombre']}")
    print(f"Equipo Visitante: {resultado['data']['equipo_visitante']['nombre']}")
    print(f"Marcador extraído: {resultado['data']['marcador_final']['local']} - {resultado['data']['marcador_final']['visitante']}")
    print(f"Validación matemática: {resultado['validation']['is_math_valid']}")
    print(f"Advertencias: {resultado['validation']['warnings']}")
    
    print("\nDetalle JSON formateado:")
    print(json.dumps(resultado, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_real_cedula_pdf()
