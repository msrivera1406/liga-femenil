import os
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont

def create_synthetic_filled_cedula():
    pdf_path = "/home/stefano/.gemini/antigravity-ide/brain/f5d7a870-a635-4091-8465-d38cb2d8722d/.user_uploaded/media_1794442806373.pdf"
    output_img_path = "/opt/lampp/htdocs/liga-femenil/ai-service/cedula_muestra_llena.jpg"

    # 1. Renderizar PDF a imagen de alta resolución
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    # Renderizar a 2x escala (~144 dpi)
    pil_image = page.render(scale=2.0).to_pil()
    draw = ImageDraw.Draw(pil_image)

    width, height = pil_image.size
    print(f"Dimensiones de imagen base: {width} x {height}")

    # Cargar fuentes del sistema o usar default
    try:
        font_header = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 26)
        font_data = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans.ttf", 24)
        font_small = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans.ttf", 20)
    except:
        font_header = ImageFont.load_default()
        font_data = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Color azul tipo tinta de pluma de árbitro
    ink_color = (20, 40, 140)

    # Coordenadas proporcionales estimadas
    # Encabezado
    draw.text((width * 0.46, height * 0.185), "Femenil Libre", fill=ink_color, font=font_data)
    draw.text((width * 0.46, height * 0.210), "12", fill=ink_color, font=font_data)
    draw.text((width * 0.54, height * 0.210), "Noviembre", fill=ink_color, font=font_data)
    draw.text((width * 0.72, height * 0.210), "4", fill=ink_color, font=font_data)
    draw.text((width * 0.81, height * 0.210), "16:30", fill=ink_color, font=font_data)

    # Árbitros
    draw.text((width * 0.25, height * 0.238), "Carlos Hernández Ramos", fill=ink_color, font=font_data)
    draw.text((width * 0.62, height * 0.238), "Roberto Mendoza", fill=ink_color, font=font_data)

    # Nombres de Equipos
    draw.text((width * 0.24, height * 0.298), "Amazonas FC", fill=ink_color, font=font_header)
    draw.text((width * 0.64, height * 0.298), "Guerreras CDMX", fill=ink_color, font=font_header)

    # Jugadoras Titulares Local (filas 1 a 7)
    local_titulares = [
        ("Laura Sánchez Mtz", "", "", "2"),
        ("Valeria Martínez", "1", "", "1"),
        ("Gabriela Flores", "", "", ""),
        ("María Morales R.", "", "", ""),
        ("Ana Paola Ruiz", "", "", ""),
        ("Sofía Herrera", "", "", ""),
        ("Camila Domínguez", "", "", "")
    ]

    row_y_start = height * 0.358
    row_height = height * 0.0298

    for i, (nom, ta, tr, g) in enumerate(local_titulares):
        y = row_y_start + (i * row_height)
        draw.text((width * 0.12, y), nom, fill=ink_color, font=font_data)
        if ta: draw.text((width * 0.38, y), ta, fill=ink_color, font=font_header)
        if tr: draw.text((width * 0.43, y), tr, fill=ink_color, font=font_header)
        if g: draw.text((width * 0.48, y), g, fill=ink_color, font=font_header)

    # Jugadoras Titulares Visitante (filas 1 a 7)
    vis_titulares = [
        ("Diana Vázquez L.", "", "", "1"),
        ("Fernanda López", "1", "", ""),
        ("Patricia Castro", "", "", ""),
        ("Daniela Ortíz", "", "", ""),
        ("Lucía Morales", "", "", ""),
        ("Elena Ramos", "", "", ""),
        ("Regina Silva", "", "", "")
    ]

    for i, (nom, ta, tr, g) in enumerate(vis_titulares):
        y = row_y_start + (i * row_height)
        draw.text((width * 0.54, y), nom, fill=ink_color, font=font_data)
        if ta: draw.text((width * 0.81, y), ta, fill=ink_color, font=font_header)
        if tr: draw.text((width * 0.86, y), tr, fill=ink_color, font=font_header)
        if g: draw.text((width * 0.90, y), g, fill=ink_color, font=font_header)

    # Marcador Final
    draw.text((width * 0.36, height * 0.640), "3", fill=ink_color, font=font_header)
    draw.text((width * 0.70, height * 0.640), "1", fill=ink_color, font=font_header)

    # Firmas de capitanes simuladas (garabato estilo firma)
    for x_offset in [width * 0.18, width * 0.68]:
        y_sig = height * 0.705
        points = [
            (x_offset, y_sig),
            (x_offset + 30, y_sig - 15),
            (x_offset + 60, y_sig + 10),
            (x_offset + 90, y_sig - 20),
            (x_offset + 120, y_sig + 5),
            (x_offset + 150, y_sig - 10)
        ]
        draw.line(points, fill=ink_color, width=3)

    # Guardar
    pil_image.save(output_img_path, quality=92)
    print(f"Cédula de prueba guardada en: {output_img_path}")
    return output_img_path

if __name__ == "__main__":
    create_synthetic_filled_cedula()
