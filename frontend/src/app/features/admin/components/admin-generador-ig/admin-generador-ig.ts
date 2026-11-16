import { Component, OnInit, ElementRef, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  TorneoService, 
  AiIgService, 
  EquiposService 
} from '../../../../core/services';
import { 
  Jornada, 
  PosicionTabla, 
  Equipo,
  IgContentType, 
  IgFormat, 
  IgTone, 
  IgContentData, 
  IgPartidoResumen, 
  IgPosicionResumen, 
  IgJugadoraDestacada 
} from '../../../../core/models';

@Component({
  selector: 'app-admin-generador-ig',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-generador-ig.html',
  styleUrls: ['./admin-generador-ig.scss']
})
export class AdminGeneradorIgComponent implements OnInit {
  private torneoService = inject(TorneoService);
  private equiposService = inject(EquiposService);
  private aiIgService = inject(AiIgService);

  @ViewChild('previewCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Datos del torneo
  jornadas = signal<Jornada[]>([]);
  posiciones = signal<PosicionTabla[]>([]);
  equipos = signal<Equipo[]>([]);
  isLoadingData = signal<boolean>(true);

  // Parámetros de selección del flujo
  selectedJornadaNumero = signal<number>(1);
  tipoContenido = signal<IgContentType>('resultados_jornada');
  formato = signal<IgFormat>('feed_4_5');
  tono = signal<IgTone>('emocionante');

  // Estado de IA y acciones
  isGeneratingAi = signal<boolean>(false);
  aiData = signal<IgContentData | null>(null);
  modelUsed = signal<string | null>(null);
  copySuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Modal secundario de edición de textos
  isEditModalOpen = signal<boolean>(false);

  // Campos editables (reactivos al canvas)
  titular = signal<string>('RESULTADOS OFICIALES');
  subtitulo = signal<string>('4.ª Edición - Jornada 1');
  caption = signal<string>('');
  datoClave = signal<string>('6 cotejos dominicales disputados con entrega total');
  hashtags = signal<string[]>([
    '#LigaMujeresDiversas', 
    '#FutbolFemenil', 
    '#OrgulloYPasión', 
    '#4taEdicion', 
    '#ComunidadSegura'
  ]);

  // Datos para Stories (Goleadora / Portera)
  destacadaNombre = signal<string>('Regina Castillo Vega');
  destacadaEquipo = signal<string>('LOBAS MÉXICO');
  destacadaDorsal = signal<string>('9');
  destacadaEstadistica = signal<string>('Doblete en 22 minutos');
  destacadaLogro = signal<string>('Goleadora de la Jornada');

  // Cache de imágenes para Canvas
  private imageCache = new Map<string, HTMLImageElement>();

  // Jornada actualmente seleccionada
  currentJornada = computed(() => {
    const num = this.selectedJornadaNumero();
    return this.jornadas().find(j => j.numero_jornada === num) || null;
  });

  constructor() {
    // Redibujar automáticamente cuando cambien variables clave
    effect(() => {
      this.selectedJornadaNumero();
      this.tipoContenido();
      this.formato();
      this.titular();
      this.subtitulo();
      this.datoClave();
      this.destacadaNombre();
      this.destacadaEquipo();
      this.destacadaDorsal();
      this.destacadaEstadistica();
      this.destacadaLogro();

      setTimeout(() => this.renderCanvas(), 60);
    });
  }

  ngOnInit(): void {
    this.cargarDatosTorneo();
  }

  cargarDatosTorneo(): void {
    this.isLoadingData.set(true);

    this.torneoService.getJornadas().subscribe({
      next: (jorns) => {
        this.jornadas.set(jorns);
        if (jorns.length > 0) {
          this.selectedJornadaNumero.set(jorns[0].numero_jornada);
        }
        this.isLoadingData.set(false);
        this.actualizarCamposPorDefecto();
      },
      error: (err) => {
        console.error('Error cargando jornadas:', err);
        this.isLoadingData.set(false);
      }
    });

    this.torneoService.getPosiciones().subscribe({
      next: (pos) => this.posiciones.set(pos),
      error: (err) => console.error('Error cargando posiciones:', err)
    });

    this.equiposService.getEquipos().subscribe({
      next: (eqs) => this.equipos.set(eqs),
      error: (err) => console.error('Error cargando equipos:', err)
    });
  }

  onTipoContenidoChange(tipo: IgContentType): void {
    this.tipoContenido.set(tipo);

    if (tipo === 'goleadora_jornada' || tipo === 'portera_segura') {
      this.formato.set('story_9_16');
      if (tipo === 'goleadora_jornada') {
        this.destacadaNombre.set('Regina Castillo Vega');
        this.destacadaEquipo.set('LOBAS MÉXICO');
        this.destacadaDorsal.set('9');
        this.destacadaEstadistica.set('2 goles en la fecha dominical');
        this.destacadaLogro.set('Máxima Anotadora de la Jornada');
      } else {
        this.destacadaNombre.set('Laura Martínez Silva');
        this.destacadaEquipo.set('VALQUIRIAS');
        this.destacadaDorsal.set('1');
        this.destacadaEstadistica.set('Valla imbatida con 6 atajadas clave');
        this.destacadaLogro.set('Portera Más Segura / Guante Imbatible');
      }
    } else {
      if (this.formato() === 'story_9_16') {
        this.formato.set('feed_4_5');
      }
    }

    this.actualizarCamposPorDefecto();
  }

  onFormatoChange(fmt: IgFormat): void {
    this.formato.set(fmt);
  }

  onJornadaChange(numStr: string): void {
    const num = parseInt(numStr, 10) || 1;
    this.selectedJornadaNumero.set(num);
    this.actualizarCamposPorDefecto();
  }

  actualizarCamposPorDefecto(): void {
    const jNum = this.selectedJornadaNumero();
    const tipo = this.tipoContenido();

    this.modelUsed.set(null);

    if (tipo === 'resultados_jornada') {
      this.titular.set(`RESULTADOS OFICIALES`);
      this.subtitulo.set(`4.ª Edición - Jornada ${jNum}`);
      this.caption.set(
        `Pulsa "Generar Lámina y Copy con IA" para que Gemini analice los marcadores oficiales de la Jornada ${jNum} y redacte en vivo el pie de foto en tono ${this.tono()} sin emojis.`
      );
      this.datoClave.set(`6 cotejos dominicales disputados con entrega total`);
    } else if (tipo === 'partido_destacado') {
      this.titular.set(`DUELO DE LA FECHA`);
      this.subtitulo.set(`Choque estelar en la 4.ª Edición`);
      this.caption.set(
        `Pulsa "Generar Lámina y Copy con IA" para que Gemini redacte una previa y crónica del partido más reñido de la Jornada ${jNum}.`
      );
      this.datoClave.set(`Definición trepidante con alto ritmo competitivo`);
    } else if (tipo === 'tabla_posiciones') {
      this.titular.set(`TABLA GENERAL`);
      this.subtitulo.set(`Liderato y zona de liguilla - Jornada ${jNum}`);
      this.caption.set(
        `Pulsa "Generar Lámina y Copy con IA" para que Gemini redacte un análisis de la tabla general y los clubes en zona de liguilla.`
      );
      this.datoClave.set(`Zona alta disputada punto a punto`);
    } else if (tipo === 'goleadora_jornada') {
      this.titular.set(`GOLEADORA DE LA FECHA`);
      this.subtitulo.set(`${this.destacadaNombre()} - ${this.destacadaEquipo()}`);
      this.caption.set(
        `Pulsa "Generar Lámina y Copy con IA" para que Gemini redacte un homenaje deportivo para ${this.destacadaNombre()} de ${this.destacadaEquipo()}.`
      );
      this.datoClave.set(this.destacadaEstadistica());
    } else if (tipo === 'portera_segura') {
      this.titular.set(`SEGURIDAD BAJO PALOS`);
      this.subtitulo.set(`${this.destacadaNombre()} - ${this.destacadaEquipo()}`);
      this.caption.set(
        `Pulsa "Generar Lámina y Copy con IA" para que Gemini redacte un homenaje a la muralla defensiva de ${this.destacadaNombre()} de ${this.destacadaEquipo()}.`
      );
      this.datoClave.set(this.destacadaEstadistica());
    }
  }

  // Generación con IA
  generarConIa(): void {
    this.isGeneratingAi.set(true);
    this.errorMessage.set(null);

    const j = this.currentJornada();
    const partidos = j?.partidos || [];

    const datosPartidos: IgPartidoResumen[] = partidos.map(p => ({
      equipo_local: p.equipo_local?.nombre || `Equipo ${p.equipo_local_id}`,
      equipo_local_escudo: p.equipo_local?.escudo_url,
      goles_local: p.goles_local,
      goles_visitante: p.goles_visitante,
      equipo_visitante: p.equipo_visitante?.nombre || `Equipo ${p.equipo_visitante_id}`,
      equipo_visitante_escudo: p.equipo_visitante?.escudo_url,
      cancha: p.cancha || 'Cancha 1',
      horario: p.horario || '09:00',
      goleadores: p.incidencias?.filter(i => i.tipo === 'gol').map(i => `${i.nombre_jugadora} (${i.minuto}')`).join(', ') || ''
    }));

    const posicionesRes: IgPosicionResumen[] = this.posiciones().slice(0, 6).map(pos => ({
      posicion: pos.posicion || 1,
      equipo: pos.nombre_equipo || 'Club',
      escudo: pos.escudo_url,
      puntos: pos.pts || 0,
      partidos_jugados: pos.pj || 0,
      diferencia_goles: pos.dg || 0
    }));

    const jugadoraDestacada: IgJugadoraDestacada = {
      nombre: this.destacadaNombre(),
      equipo: this.destacadaEquipo(),
      dorsal: this.destacadaDorsal(),
      logro: this.destacadaLogro(),
      estadistica: this.destacadaEstadistica()
    };

    this.aiIgService.generateContent({
      tipo_contenido: this.tipoContenido(),
      formato: this.formato(),
      tono: this.tono(),
      jornada_numero: this.selectedJornadaNumero(),
      fecha: j?.fecha_domingo || 'Domingo 4 de Octubre de 2026',
      datos_partidos: datosPartidos,
      tabla_posiciones: posicionesRes,
      jugadora_destacada: jugadoraDestacada
    }).subscribe({
      next: (res) => {
        this.isGeneratingAi.set(false);
        if (res?.success && res.data) {
          this.aiData.set(res.data);
          this.modelUsed.set(res.model_used || 'Gemini Flash');
          this.titular.set(res.data.titular.toUpperCase());
          this.subtitulo.set(res.data.subtitulo);
          this.caption.set(res.data.caption);
          this.datoClave.set(res.data.dato_clave);
          if (res.data.hashtags && res.data.hashtags.length > 0) {
            this.hashtags.set(res.data.hashtags);
          }
          this.renderCanvas();
        }
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        this.errorMessage.set(err.message || 'Error al conectar con la IA de Instagram.');
        console.error('Error generando copy IG:', err);
      }
    });
  }

  // Modal de edición
  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.renderCanvas();
  }

  // Copiar pie de foto sin emojis
  copiarCaption(): void {
    const hashtagsStr = this.hashtags().join(' ');
    const fullText = `${this.caption()}\n\n${hashtagsStr}`;

    navigator.clipboard.writeText(fullText).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 3000);
    }).catch(err => {
      console.warn('Fallback clipboard:', err);
    });
  }

  // Descargar imagen
  descargarImagen(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const jNum = this.selectedJornadaNumero();
    const tipo = this.tipoContenido();
    const fmt = this.formato();
    const filename = `LDFM_Jornada_${jNum}_${tipo}_${fmt}.png`;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error descargando imagen canvas:', e);
    }
  }

  // --------------------------------------------------------------------------
  // MOTOR DE RENDERIZADO CON LA PALETA OFICIAL VIBRANTE DE LA LIGA
  // --------------------------------------------------------------------------
  async renderCanvas(): Promise<void> {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fmt = this.formato();
    let width = 1080;
    let height = 1350; // Feed 4:5

    if (fmt === 'cuadrado_1_1') {
      height = 1080;
    } else if (fmt === 'story_9_16') {
      height = 1920;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. FONDO CON REFLECTORES VIBRANTES (Magenta Neón + Violeta Eléctrico)
    this.drawOfficialStadiumBackground(ctx, width, height);

    // 2. ENCABEZADO OFICIAL DE LA LIGA (LIGA MUJERES DIVERSAS + LÍNEA ARCOÍRIS)
    this.drawOfficialHeader(ctx, width, height);

    // 3. CUERPO SEGÚN TIPO DE CONTENIDO
    const tipo = this.tipoContenido();
    if (tipo === 'goleadora_jornada' || tipo === 'portera_segura') {
      await this.drawStoryHero(ctx, width, height, tipo);
    } else if (tipo === 'tabla_posiciones') {
      await this.drawStandingsTable(ctx, width, height);
    } else if (tipo === 'partido_destacado') {
      await this.drawFeaturedDuel(ctx, width, height);
    } else {
      await this.drawMatchResultsList(ctx, width, height);
    }

    // 4. FOOTER OFICIAL CON LÍNEA ARCOÍRIS Y VALORES
    this.drawOfficialFooter(ctx, width, height);
  }

  // FONDO CON AMBIENTE DE ESTADIO VIBRANTE (COLORES REALES DE LAS FOTOS)
  private drawOfficialStadiumBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Fondo base negro-azulado deportivo
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090312');
    bgGrad.addColorStop(0.35, '#130424');
    bgGrad.addColorStop(0.7, '#1c0736');
    bgGrad.addColorStop(1, '#090312');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Reflector 1: Resplandor Magenta / Fucsia Neón (Superior Izquierda)
    const glowPink = ctx.createRadialGradient(width * 0.15, height * 0.18, 40, width * 0.15, height * 0.18, 550);
    glowPink.addColorStop(0, 'rgba(255, 0, 127, 0.40)');
    glowPink.addColorStop(0.5, 'rgba(236, 72, 153, 0.15)');
    glowPink.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowPink;
    ctx.fillRect(0, 0, width, height);

    // Reflector 2: Resplandor Violeta Eléctrico (Superior Derecha)
    const glowPurple = ctx.createRadialGradient(width * 0.85, height * 0.22, 40, width * 0.85, height * 0.22, 600);
    glowPurple.addColorStop(0, 'rgba(147, 51, 234, 0.45)');
    glowPurple.addColorStop(0.5, 'rgba(126, 34, 206, 0.18)');
    glowPurple.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowPurple;
    ctx.fillRect(0, 0, width, height);

    // Reflector 3: Resplandor Central Inferior Dorado / Neón
    const glowCenter = ctx.createRadialGradient(width / 2, height * 0.88, 30, width / 2, height * 0.88, 500);
    glowCenter.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
    glowCenter.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
    glowCenter.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowCenter;
    ctx.fillRect(0, 0, width, height);

    // Partículas / Destellos dorados y fucsias de estadio
    const sparkles = [
      { x: 120, y: 140, r: 2.5, c: '#ff007f' },
      { x: 260, y: 220, r: 3, c: '#facc15' },
      { x: 890, y: 160, r: 2.5, c: '#a855f7' },
      { x: 960, y: 290, r: 3.5, c: '#ff007f' },
      { x: 180, y: height - 220, r: 3, c: '#facc15' },
      { x: 920, y: height - 190, r: 3, c: '#ec4899' }
    ];
    for (const sp of sparkles) {
      ctx.fillStyle = sp.c;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Marco exterior con doble acento fucsia y dorado
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, width - 76, height - 76);
  }

  // ENCABEZADO OFICIAL FIEL A LAS FOTOGRAFÍAS DE LA LIGA
  private drawOfficialHeader(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const centerX = width / 2;

    // 1. "LIGA" en blanco puro
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('LIGA', centerX, 65);

    // 2. "MUJERES DIVERSAS" (MUJERES en fucsia / DIVERSAS en gradiente multicolor)
    const titleY = 105;
    ctx.font = '900 50px "Inter", sans-serif';
    const textMujeres = 'MUJERES ';
    const textDiversas = 'DIVERSAS';
    const wMujeres = ctx.measureText(textMujeres).width;
    const wDiversas = ctx.measureText(textDiversas).width;
    const startX = (width - (wMujeres + wDiversas)) / 2;

    // MUJERES (Fucsia Neón brillante #ff007f)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = 'rgba(255, 0, 127, 0.7)';
    ctx.shadowBlur = 12;
    ctx.fillText(textMujeres, startX, titleY);

    // DIVERSAS (Gradiente Multicolor / Arcoíris)
    const divGrad = ctx.createLinearGradient(startX + wMujeres, 0, startX + wMujeres + wDiversas, 0);
    divGrad.addColorStop(0, '#06b6d4');
    divGrad.addColorStop(0.35, '#10b981');
    divGrad.addColorStop(0.7, '#facc15');
    divGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = divGrad;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(textDiversas, startX + wMujeres, titleY);

    // Limpiar sombras para el resto del canvas
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 3. Barra Arcoíris Oficial
    const barY = titleY + 65;
    const barW = 480;
    const barGrad = ctx.createLinearGradient(centerX - barW / 2, 0, centerX + barW / 2, 0);
    barGrad.addColorStop(0, '#ef4444');
    barGrad.addColorStop(0.2, '#f59e0b');
    barGrad.addColorStop(0.4, '#10b981');
    barGrad.addColorStop(0.6, '#06b6d4');
    barGrad.addColorStop(0.8, '#8b5cf6');
    barGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = barGrad;
    ctx.fillRect(centerX - barW / 2, barY, barW, 5);

    // 4. Edición Oficial ("4.ª EDICIÓN OFICIAL")
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4.ª EDICIÓN OFICIAL', centerX, barY + 14);

    // 5. Titular Principal de la Lámina (Ajuste automático para que nunca desborde)
    const headlineY = barY + 44;
    const maxHeadlineW = width - 180;
    const cleanTitular = (this.titular() || 'RESULTADOS OFICIALES').toUpperCase();
    const headlineHeight = this.drawAutoFittedText(
      ctx,
      cleanTitular,
      centerX,
      headlineY,
      maxHeadlineW,
      38,
      24,
      '900',
      '#ffffff',
      true
    );

    // 6. Subtítulo descriptivo (Envoltura automática de hasta 2 líneas)
    const subtitleY = headlineY + headlineHeight + 8;
    const maxSubtitleW = width - 200;
    ctx.font = '700 20px "Inter", sans-serif';
    ctx.fillStyle = '#fde047';
    this.drawWrappedText(
      ctx,
      this.subtitulo() || 'Jornada Dominical',
      centerX,
      subtitleY,
      maxSubtitleW,
      26,
      2,
      true
    );
  }

  // DIBUJAR LISTA DE RESULTADOS DE LA JORNADA
  private async drawMatchResultsList(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void> {
    const j = this.currentJornada();
    const partidos = j?.partidos || [];
    const centerX = width / 2;

    const startY = height > 1400 ? 350 : 315;
    const cardW = width - 120;
    const availableHeight = height - startY - 145;
    const cardH = Math.min(125, Math.floor(availableHeight / 6.3));
    const gap = Math.min(16, Math.floor((availableHeight - (cardH * 6)) / 5));

    for (let i = 0; i < Math.min(6, partidos.length); i++) {
      const p = partidos[i];
      const y = startY + i * (cardH + gap);

      // Tarjeta con fondo translúcido y borde fucsia/púrpura neón
      ctx.fillStyle = 'rgba(20, 8, 38, 0.75)';
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 0, 127, 0.45)' : 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1.8;
      this.drawRoundedRect(ctx, centerX - cardW / 2, y, cardW, cardH, 14);
      ctx.fill();
      ctx.stroke();

      // Escudo Local
      const locEscudo = p.equipo_local?.escudo_url || '';
      await this.drawCrestWithGlow(ctx, locEscudo, centerX - 360, y + cardH / 2, 40, '#ff007f');

      // Nombre Local (Ajustado automáticamente al ancho disponible)
      const locNom = (p.equipo_local?.nombre || 'Local').toUpperCase();
      this.drawFittedLine(ctx, locNom, centerX - 120, y + cardH / 2 - 6, 210, 'right', '#ffffff');

      // Caja de Marcador Central (Dorado brillante)
      const scoreBoxW = 130;
      const scoreBoxH = 50;
      ctx.fillStyle = 'rgba(10, 3, 20, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      this.drawRoundedRect(ctx, centerX - scoreBoxW / 2, y + cardH / 2 - scoreBoxH / 2, scoreBoxW, scoreBoxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${p.goles_local} - ${p.goles_visitante}`, centerX, y + cardH / 2);

      // Nombre Visitante (Ajustado automáticamente al ancho disponible)
      const visNom = (p.equipo_visitante?.nombre || 'Visitante').toUpperCase();
      this.drawFittedLine(ctx, visNom, centerX + 120, y + cardH / 2 - 6, 210, 'left', '#ffffff');

      // Escudo Visitante
      const visEscudo = p.equipo_visitante?.escudo_url || '';
      await this.drawCrestWithGlow(ctx, visEscudo, centerX + 360, y + cardH / 2, 40, '#a855f7');

      // Cancha y Horario en pastilla sutil
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.cancha || 'Cancha 1'}  |  ${p.horario || '09:00'} hrs`, centerX, y + cardH - 12);
    }
  }

  // DIBUJAR DUELO DE LA FECHA
  private async drawFeaturedDuel(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void> {
    const j = this.currentJornada();
    const p = j?.partidos?.[0];
    if (!p) return;

    const centerX = width / 2;
    const startY = 350;

    // Gran contenedor del choque
    const boxW = width - 120;
    const boxH = 590;
    ctx.fillStyle = 'rgba(20, 8, 38, 0.85)';
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;
    this.drawRoundedRect(ctx, centerX - boxW / 2, startY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Escudos Gigantes con resplandor neón
    const locEscudo = p.equipo_local?.escudo_url || '';
    const visEscudo = p.equipo_visitante?.escudo_url || '';
    await this.drawCrestWithGlow(ctx, locEscudo, centerX - 250, startY + 175, 96, '#ff007f');
    await this.drawCrestWithGlow(ctx, visEscudo, centerX + 250, startY + 175, 96, '#a855f7');

    // Nombres gigantes
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((p.equipo_local?.nombre || 'Local').toUpperCase(), centerX - 250, startY + 315);
    ctx.fillText((p.equipo_visitante?.nombre || 'Visitante').toUpperCase(), centerX + 250, startY + 315);

    // Marcador Central Gigante
    ctx.fillStyle = '#fde047';
    ctx.font = '900 86px "Inter", sans-serif';
    ctx.fillText(`${p.goles_local} - ${p.goles_visitante}`, centerX, startY + 200);

    // Cancha y horario
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.fillText(`${p.cancha || 'Cancha Principal'}  |  ${p.horario || '10:00'} hrs`, centerX, startY + 395);

    // Pastilla del dato clave con ajuste dinámico y envoltura estricta para no salirse
    if (this.datoClave()) {
      const dW = boxW - 80;
      const textPadding = 24;
      const textMaxW = dW - (textPadding * 2);

      // Calcular líneas necesarias
      ctx.font = '700 18px "Inter", sans-serif';
      const words = this.datoClave().split(' ');
      const testLines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > textMaxW && cur) {
          testLines.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) testLines.push(cur);
      const linesCount = Math.min(testLines.length, 2);

      const pillH = linesCount > 1 ? 74 : 52;
      const pillY = startY + 470 - (pillH - 52) / 2;

      ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 1.5;
      this.drawRoundedRect(ctx, centerX - dW / 2, pillY, dW, pillH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 18px "Inter", sans-serif';
      const textStartY = pillY + (pillH / 2) - ((linesCount - 1) * 22) / 2;
      this.drawWrappedText(ctx, this.datoClave(), centerX, textStartY, textMaxW, 22, 2, true);
    }
  }

  // DIBUJAR TABLA DE POSICIONES
  private async drawStandingsTable(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void> {
    const centerX = width / 2;
    const startY = 330;
    const tableW = width - 120;
    const posList = this.posiciones().slice(0, 6);

    // Encabezado de la tabla con gradiente fucsia-morado
    ctx.fillStyle = 'rgba(255, 0, 127, 0.25)';
    this.drawRoundedRect(ctx, centerX - tableW / 2, startY, tableW, 46, 10);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 16px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('POS', centerX - tableW / 2 + 25, startY + 24);
    ctx.fillText('CLUB', centerX - tableW / 2 + 95, startY + 24);
    ctx.textAlign = 'center';
    ctx.fillText('PJ', centerX + 180, startY + 24);
    ctx.fillText('DG', centerX + 280, startY + 24);
    ctx.fillText('PTS', centerX + 380, startY + 24);

    const rowH = 90;
    for (let i = 0; i < posList.length; i++) {
      const pos = posList[i];
      const y = startY + 56 + i * (rowH + 10);

      // Fila con resaltado para puestos de clasificación (top 4)
      ctx.fillStyle = i < 4 ? 'rgba(255, 0, 127, 0.12)' : 'rgba(20, 8, 38, 0.75)';
      ctx.strokeStyle = i < 4 ? 'rgba(250, 204, 21, 0.5)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = i < 4 ? 1.8 : 1;
      this.drawRoundedRect(ctx, centerX - tableW / 2, y, tableW, rowH, 12);
      ctx.fill();
      ctx.stroke();

      // Número de posición
      ctx.fillStyle = i < 4 ? '#fde047' : '#ffffff';
      ctx.font = '900 24px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, centerX - tableW / 2 + 35, y + rowH / 2);

      // Escudo
      const escudo = pos.escudo_url || '';
      await this.drawCrestWithGlow(ctx, escudo, centerX - tableW / 2 + 115, y + rowH / 2, 28, '#facc15');

      // Nombre del club
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText((pos.nombre_equipo || 'Club').toUpperCase(), centerX - tableW / 2 + 170, y + rowH / 2);

      // Estadísticas
      ctx.font = '700 20px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pos.pj || 0}`, centerX + 180, y + rowH / 2);
      ctx.fillText(`${(pos.dg || 0) > 0 ? '+' : ''}${pos.dg || 0}`, centerX + 280, y + rowH / 2);

      ctx.fillStyle = '#fde047';
      ctx.font = '900 26px "Inter", sans-serif';
      ctx.fillText(`${pos.pts || 0}`, centerX + 380, y + rowH / 2);
    }
  }

  // DIBUJAR STORY 9:16 (GOLEADORA O PORTERA)
  private async drawStoryHero(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    tipo: 'goleadora_jornada' | 'portera_segura'
  ): Promise<void> {
    const centerX = width / 2;
    const isGoleadora = tipo === 'goleadora_jornada';
    const accentColor = isGoleadora ? '#ff007f' : '#06b6d4';

    // Gran Tarjeta Heroica Vertical
    const cardW = width - 110;
    const cardH = height * 0.65;
    const cardY = 320;

    const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
    cardGrad.addColorStop(0, 'rgba(25, 9, 45, 0.90)');
    cardGrad.addColorStop(1, 'rgba(10, 3, 20, 0.95)');
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    this.drawRoundedRect(ctx, centerX - cardW / 2, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.stroke();

    // Cinta Superior del Galardón
    const ribbonW = 560;
    const ribbonH = 64;
    const ribbonY = cardY - ribbonH / 2;
    ctx.fillStyle = accentColor;
    this.drawRoundedRect(ctx, centerX - ribbonW / 2, ribbonY, ribbonW, ribbonH, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const awardTitle = isGoleadora ? 'GOLEADORA DE LA JORNADA' : 'PORTERA MÁS SEGURA';
    ctx.fillText(awardTitle, centerX, ribbonY + ribbonH / 2);

    // Círculo de Dorsal
    const circleY = cardY + 220;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, circleY, 115, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = '900 110px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${this.destacadaDorsal()}`, centerX, circleY - 10);

    // Escudo del equipo
    const eqObj = this.equipos().find(e => e.nombre.toLowerCase() === this.destacadaEquipo().toLowerCase());
    const escudoUrl = eqObj?.escudo_url || '';
    if (escudoUrl) {
      await this.drawCrestWithGlow(ctx, escudoUrl, centerX + 115, circleY + 80, 52, accentColor);
    }

    // Nombre de la jugadora en blanco y oro (Auto-ajustable al ancho)
    const nameY = circleY + 185;
    this.drawAutoFittedText(
      ctx,
      this.destacadaNombre().toUpperCase(),
      centerX,
      nameY,
      cardW - 60,
      44,
      28,
      '900',
      '#ffffff',
      true
    );

    // Club
    this.drawAutoFittedText(
      ctx,
      this.destacadaEquipo().toUpperCase(),
      centerX,
      nameY + 54,
      cardW - 80,
      28,
      20,
      '800',
      '#fde047',
      true
    );

    // Bloque de Cifra Oficial
    const statBoxW = cardW - 100;
    const statBoxH = 120;
    const statBoxY = nameY + 135;

    ctx.fillStyle = 'rgba(10, 3, 20, 0.9)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, centerX - statBoxW / 2, statBoxY, statBoxW, statBoxH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = '800 20px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('CIFRA OFICIAL EN LA CANCHA', centerX, statBoxY + 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px "Inter", sans-serif';
    this.drawWrappedText(
      ctx,
      this.destacadaEstadistica().toUpperCase(),
      centerX,
      statBoxY + 54,
      statBoxW - 40,
      30,
      2,
      true
    );
  }

  // FOOTER OFICIAL CON LÍNEA ARCOÍRIS Y VALORES (IDÉNTICO A LAS FOTOS REALES)
  private drawOfficialFooter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const centerX = width / 2;
    const footerY = height - 60;

    // 1. Barra arcoíris
    const barW = Math.min(540, width - 140);
    const barGrad = ctx.createLinearGradient(centerX - barW / 2, 0, centerX + barW / 2, 0);
    barGrad.addColorStop(0, '#ef4444');
    barGrad.addColorStop(0.2, '#f59e0b');
    barGrad.addColorStop(0.4, '#10b981');
    barGrad.addColorStop(0.6, '#06b6d4');
    barGrad.addColorStop(0.8, '#8b5cf6');
    barGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = barGrad;
    ctx.fillRect(centerX - barW / 2, footerY - 42, barW, 4);

    // 2. Valores oficiales
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '700 14px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RESPETO   ·   IGUALDAD   ·   DIVERSIDAD   ·   COMUNIDAD   ·   INCLUSIÓN', centerX, footerY - 20);

    // 3. Slogan oficial de la liga
    ctx.fillStyle = '#fde047';
    ctx.font = 'italic 700 17px "Inter", sans-serif';
    ctx.fillText('No somos una liga, somos una comunidad.', centerX, footerY + 12);
  }

  // Helper para dibujar escudos con resplandor circular
  private drawCrestWithGlow(
    ctx: CanvasRenderingContext2D, 
    url: string, 
    x: number, 
    y: number, 
    radius: number,
    ringColor: string = '#facc15'
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!url) {
        this.drawFallbackCrest(ctx, x, y, radius);
        resolve();
        return;
      }

      const img = this.imageCache.get(url) || new Image();
      if (!this.imageCache.has(url)) {
        img.crossOrigin = 'anonymous';
        img.src = url;
        this.imageCache.set(url, img);
      }

      const render = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();

        // Anillo de color neón o dorado
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        resolve();
      };

      if (img.complete && img.naturalWidth !== 0) {
        render();
      } else {
        img.onload = () => render();
        img.onerror = () => {
          this.drawFallbackCrest(ctx, x, y, radius);
          resolve();
        };
      }
    });
  }

  private drawFallbackCrest(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.fillStyle = '#2e1065';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = '700 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LDFM', x, y);
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Helper para envolver texto multilínea sin que jamás se salga de maxWidth
  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 3,
    center: boolean = true
  ): number {
    if (!text) return 0;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const visibleLines = lines.slice(0, maxLines);
    if (lines.length > maxLines && visibleLines.length > 0) {
      const lastIdx = visibleLines.length - 1;
      let last = visibleLines[lastIdx];
      while (last.length > 4 && ctx.measureText(last + '...').width > maxWidth) {
        last = last.slice(0, -1);
      }
      visibleLines[lastIdx] = last + '...';
    }

    ctx.textAlign = center ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    visibleLines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });

    return visibleLines.length;
  }

  // Helper para auto-escalar fuente o dividir en 2 líneas si el texto es largo
  private drawAutoFittedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    maxFontSize: number,
    minFontSize: number = 22,
    fontWeight: string = '900',
    fontColor: string = '#ffffff',
    center: boolean = true
  ): number {
    let currentSize = maxFontSize;
    ctx.font = `${fontWeight} ${currentSize}px "Inter", sans-serif`;

    while (ctx.measureText(text).width > maxWidth && currentSize > minFontSize) {
      currentSize -= 2;
      ctx.font = `${fontWeight} ${currentSize}px "Inter", sans-serif`;
    }

    ctx.fillStyle = fontColor;

    if (ctx.measureText(text).width > maxWidth) {
      ctx.font = `${fontWeight} ${minFontSize}px "Inter", sans-serif`;
      const numLines = this.drawWrappedText(ctx, text, x, y + minFontSize / 2, maxWidth, minFontSize * 1.25, 2, center);
      return numLines * (minFontSize * 1.25);
    } else {
      ctx.textAlign = center ? 'center' : 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
      return currentSize * 1.25;
    }
  }

  // Helper para ajustar una sola línea (ej: nombres de equipos)
  private drawFittedLine(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    align: 'left' | 'right' | 'center' = 'left',
    color: string = '#ffffff'
  ): void {
    let size = 22;
    ctx.font = `800 ${size}px "Inter", sans-serif`;
    while (ctx.measureText(text).width > maxWidth && size > 15) {
      size -= 1;
      ctx.font = `800 ${size}px "Inter", sans-serif`;
    }
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }
}
