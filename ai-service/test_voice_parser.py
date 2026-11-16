import json
from voice_parser import VoiceIncidentParser

def test_voice():
    parser = VoiceIncidentParser()
    
    equipo_local = {
        "id": 1,
        "nombre": "Queer Goals",
        "roster": [
            {"id": 101, "nombre": "Laura Sánchez", "nombre_deportivo": "Laura Sánchez", "dorsal": 7},
            {"id": 102, "nombre": "Sofía Morales", "nombre_deportivo": "Sofía Morales", "dorsal": 10},
            {"id": 103, "nombre": "Camila Torres", "nombre_deportivo": "Camila Torres", "dorsal": 1}
        ]
    }
    
    equipo_visitante = {
        "id": 2,
        "nombre": "Valquirias",
        "roster": [
            {"id": 201, "nombre": "Brenda Ruiz", "nombre_deportivo": "Brenda Ruiz", "dorsal": 9},
            {"id": 202, "nombre": "Valeria Martínez", "nombre_deportivo": "Valeria Martínez", "dorsal": 5},
            {"id": 203, "nombre": "Fernanda López", "nombre_deportivo": "Fernanda López", "dorsal": 11}
        ]
    }

    test_phrases = [
        "Gol de Queer Goals dorsal 7 al minuto 18",
        "Tarjeta amarilla a la número 5 de Valquirias al minuto 32",
        "Golazo de Sofía Morales de Queer Goals",
        "Tarjeta roja directa a Brenda Ruiz de Valquirias"
    ]

    for phrase in test_phrases:
        print("\n" + "="*50)
        print("Probando frase:", phrase)
        res = parser.parse_transcript(
            transcript=phrase,
            equipo_local=equipo_local,
            equipo_visitante=equipo_visitante,
            minuto_actual=25
        )
        print("Modelo usado:", res.get("model_used"))
        print("Resultado estructurado:", json.dumps(res.get("data"), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    test_voice()
