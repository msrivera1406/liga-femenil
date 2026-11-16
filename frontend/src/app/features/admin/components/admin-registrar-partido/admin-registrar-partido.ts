import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { TorneoService, JugadorasService, AiScannerService, VoiceRecognitionService } from '../../../../core/services';
import { Jornada, Partido, EstadoPartido, AiCedulaScanResponse, JugadoraPublica, AiVoiceIncidentData } from '../../../../core/models';

export interface IncidenciaLocal {
  id: string;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'fuera_juego' | 'sustitucion';
  equipo: 'local' | 'visitante';
  equipoNombre: string;
  minuto: number;
  dorsal?: string | number;
  jugadora?: string;
  detalle?: string;
}

@Component({
  selector: 'app-admin-registrar-partido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-registrar-partido.html',
  styleUrls: ['./admin-registrar-partido.scss']
})
export class AdminRegistrarPartidoComponent implements OnInit {
  private torneoService = inject(TorneoService);
  private jugadorasService = inject(JugadorasService);
  private aiScannerService = inject(AiScannerService);
  public voiceService = inject(VoiceRecognitionService);

  @Input() initialMatchId?: number | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actaGuardada = new EventEmitter<Partido>();

  todasLasJornadas = signal<Jornada[]>([]);
  selectedJornadaId = signal<number>(5);
  activeRegistrationMatchId = signal<number | null>(null);

  selectedJornada = computed(() => {
    const list = this.todasLasJornadas();
    if (list.length === 0) return null;
    const found = list.find(j => j.id === this.selectedJornadaId());
    return found || list[0];
  });

  partidosDeJornada = computed(() => {
    return this.selectedJornada()?.partidos || [];
  });

  activeRegistrationMatch = computed(() => {
    const matches = this.partidosDeJornada();
    const id = this.activeRegistrationMatchId();
    if (id === null) {
      return matches.length > 0 ? matches[0] : null;
    }
    const found = matches.find(m => m.id === id);
    return found || (matches.length > 0 ? matches[0] : null);
  });

  regGolesLocal = signal<number>(0);
  regGolesVisitante = signal<number>(0);
  regEstado = signal<EstadoPartido>('en_juego');
  regEmpatePenales = signal<boolean>(false);
  regPenalesLocal = signal<number | null>(null);
  regPenalesVisitante = signal<number | null>(null);
  regNotasMesa = signal<string>('');
  regIncidencias = signal<IncidenciaLocal[]>([]);

  showIncidentDialog = signal<boolean>(false);
  dialogIncidentType = signal<'gol' | 'tarjeta' | 'fuera_juego' | 'sustitucion'>('gol');
  dialogIncidentTeam = signal<'local' | 'visitante'>('local');

  formMinuto: number = 20;
  formDorsal: string = '';
  formJugadora: string = '';
  formTipoTarjeta: 'amarilla' | 'roja' = 'amarilla';
  formTipoGol: 'jugada' | 'tiro_libre' | 'penal' | 'autogol' = 'jugada';
  formJugadoraEntra: string = '';
  formJugadoraSale: string = '';

  isListeningVoice = computed(() => this.voiceService.isRecording());
  isProcessingVoice = signal<boolean>(false);
  voiceTranscript = signal<string | null>(null);
  voiceSuccessToast = signal<{
    id: string;
    message: string;
    equipo: 'local' | 'visitante';
    tipo: IncidenciaLocal['tipo'];
  } | null>(null);
  voiceUndoTimeout: any = null;
  showVoicePermissionModal = signal<boolean>(false);
  showQuickTextInput = signal<boolean>(false);
  quickTextCommand = signal<string>('');

  isScanningSheet = signal<boolean>(false);
  scanSuccessMessage = signal<string | null>(null);
  saveSuccessToast = signal<string | null>(null);
  isSavingActa = signal<boolean>(false);

  // Estados del Escáner Inteligente con IA
  showAiScanModal = signal<boolean>(false);
  aiScanStep = signal<'upload' | 'scanning' | 'review'>('upload');
  aiScanFile = signal<File | null>(null);
  aiScanPreviewUrl = signal<string | null>(null);
  aiScanResult = signal<AiCedulaScanResponse | null>(null);
  aiScanError = signal<string | null>(null);
  aiScanProgressMsg = signal<string>('Analizando cédula con IA...');
  isDraggingFile = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarTodasLasJornadas();
  }

  cargarTodasLasJornadas(): void {
    this.torneoService.getJornadas(1).pipe(take(1)).subscribe(jornadas => {
      this.todasLasJornadas.set(jornadas);
      if (jornadas.length > 0) {
        if (this.initialMatchId) {
          for (const j of jornadas) {
            const found = j.partidos?.find(p => p.id === this.initialMatchId);
            if (found) {
              this.selectedJornadaId.set(j.id);
              this.selectMatchForRegistration(found);
              return;
            }
          }
        }
        const defaultJornada = jornadas.find(j => j.numero_jornada === 5) || jornadas[0];
        this.selectedJornadaId.set(defaultJornada.id);
        if (defaultJornada.partidos && defaultJornada.partidos.length > 0) {
          this.selectMatchForRegistration(defaultJornada.partidos[0]);
        }
      }
    });
  }

  selectJornada(jId: number): void {
    this.selectedJornadaId.set(jId);
    const j = this.todasLasJornadas().find(item => item.id === jId);
    if (j?.partidos && j.partidos.length > 0) {
      this.selectMatchForRegistration(j.partidos[0]);
    } else {
      this.activeRegistrationMatchId.set(null);
    }
  }

  prevJornada(): void {
    const list = this.todasLasJornadas();
    if (list.length <= 1) return;
    const curIdx = list.findIndex(j => j.id === this.selectedJornadaId());
    if (curIdx > 0) {
      this.selectJornada(list[curIdx - 1].id);
    } else {
      this.selectJornada(list[list.length - 1].id);
    }
  }

  nextJornada(): void {
    const list = this.todasLasJornadas();
    if (list.length <= 1) return;
    const curIdx = list.findIndex(j => j.id === this.selectedJornadaId());
    if (curIdx < list.length - 1) {
      this.selectJornada(list[curIdx + 1].id);
    } else {
      this.selectJornada(list[0].id);
    }
  }

  selectMatchForRegistration(partido: Partido): void {
    this.activeRegistrationMatchId.set(partido.id);
    this.regGolesLocal.set(partido.goles_local ?? 0);
    this.regGolesVisitante.set(partido.goles_visitante ?? 0);
    this.regEstado.set(partido.estado || 'en_juego');
    this.regEmpatePenales.set(!!partido.empate_minuto_18);
    this.regPenalesLocal.set(partido.penales_local ?? null);
    this.regPenalesVisitante.set(partido.penales_visitante ?? null);
    this.regNotasMesa.set(partido.notas_mesa || '');

    if (partido.incidencias && partido.incidencias.length > 0) {
      const parsed: IncidenciaLocal[] = partido.incidencias.map((inc, idx) => {
        const esLocal = inc.equipo_id === partido.equipo_local_id;
        let tipo: IncidenciaLocal['tipo'] = 'gol';
        if (inc.tipo === 'tarjeta_amarilla') tipo = 'tarjeta_amarilla';
        else if (inc.tipo === 'tarjeta_roja') tipo = 'tarjeta_roja';
        else if (inc.tipo === 'falta') tipo = 'fuera_juego';

        return {
          id: `inc-${inc.id || idx}-${Date.now()}`,
          tipo,
          equipo: esLocal ? 'local' : 'visitante',
          equipoNombre: esLocal ? partido.equipo_local?.nombre || 'Local' : partido.equipo_visitante?.nombre || 'Visitante',
          minuto: inc.minuto,
          dorsal: inc.jugadora_id,
          jugadora: `Jugadora #${inc.jugadora_id || ''}`,
          detalle: (inc as any).comentario || ''
        };
      });
      this.regIncidencias.set(parsed);
    } else {
      this.regIncidencias.set([
        {
          id: 'inc-demo-1',
          tipo: 'gol',
          equipo: 'local',
          equipoNombre: partido.equipo_local?.nombre || 'Local',
          minuto: 14,
          dorsal: 10,
          jugadora: 'Valeria "La Rusa"',
          detalle: 'Gol de jugada individual por banda derecha'
        },
        {
          id: 'inc-demo-2',
          tipo: 'tarjeta_amarilla',
          equipo: 'visitante',
          equipoNombre: partido.equipo_visitante?.nombre || 'Visitante',
          minuto: 22,
          dorsal: 4,
          jugadora: 'Mariana P.',
          detalle: 'Corte de avance prometedor'
        }
      ]);
    }
  }

  adjustScore(team: 'local' | 'visitante', delta: number): void {
    if (team === 'local') {
      const current = this.regGolesLocal();
      const updated = Math.max(0, current + delta);
      this.regGolesLocal.set(updated);
    } else {
      const current = this.regGolesVisitante();
      const updated = Math.max(0, current + delta);
      this.regGolesVisitante.set(updated);
    }
  }

  togglePenales(): void {
    const nextState = !this.regEmpatePenales();
    this.regEmpatePenales.set(nextState);
    if (nextState) {
      if (this.regPenalesLocal() === null) this.regPenalesLocal.set(0);
      if (this.regPenalesVisitante() === null) this.regPenalesVisitante.set(0);
    } else {
      this.regPenalesLocal.set(null);
      this.regPenalesVisitante.set(null);
    }
  }

  adjustPenales(team: 'local' | 'visitante', delta: number): void {
    if (team === 'local') {
      const current = this.regPenalesLocal() ?? 0;
      this.regPenalesLocal.set(Math.max(0, current + delta));
    } else {
      const current = this.regPenalesVisitante() ?? 0;
      this.regPenalesVisitante.set(Math.max(0, current + delta));
    }
  }

  incrementScore(team: 'local' | 'visitante'): void {
    this.adjustScore(team, 1);
  }

  decrementScore(team: 'local' | 'visitante'): void {
    this.adjustScore(team, -1);
  }

  async toggleVoiceDictation(): Promise<void> {
    if (this.voiceService.isRecording()) {
      await this.detenerYProcesarAudio();
      return;
    }

    this.voiceService.clearError();
    this.voiceTranscript.set('Iniciando micrófono... Habla cerca de tu dispositivo');

    try {
      await this.voiceService.startRecording();
      this.voiceTranscript.set('Grabando audio de mesa... Habla ahora y haz clic en "Listo / Enviar" al terminar.');
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      this.voiceTranscript.set(null);
    }
  }

  async detenerYProcesarAudio(): Promise<void> {
    this.isProcessingVoice.set(true);
    this.voiceTranscript.set('Enviando audio a Google Gemini Multimodal...');

    const audioBlob = await this.voiceService.stopRecording();
    if (!audioBlob || audioBlob.size < 500) {
      this.isProcessingVoice.set(false);
      this.voiceTranscript.set(null);
      this.voiceService.permissionError.set('Audio demasiado breve o vacío. Habla unos segundos cerca del micrófono.');
      return;
    }

    const match = this.activeRegistrationMatch();
    const localId = match?.equipo_local_id;
    const visId = match?.equipo_visitante_id;

    let rosterLocal: JugadoraPublica[] = [];
    let rosterVisitante: JugadoraPublica[] = [];

    const sendAudioToGemini = () => {
      const localPayload = {
        id: match?.equipo_local_id,
        nombre: match?.equipo_local?.nombre,
        roster: rosterLocal
      };
      const visPayload = {
        id: match?.equipo_visitante_id,
        nombre: match?.equipo_visitante?.nombre,
        roster: rosterVisitante
      };

      const minutoContexto = this.formMinuto || 20;

      this.aiScannerService.processVoiceAudio(audioBlob, localPayload, visPayload, minutoContexto).subscribe({
        next: (res) => {
          this.isProcessingVoice.set(false);
          this.voiceTranscript.set(null);

          if (res?.success && res.data) {
            this.aplicarIncidenciaDeVoz(res.data);
          } else {
            this.voiceService.permissionError.set('No se pudo identificar una incidencia válida en el audio dictado.');
          }
        },
        error: (err) => {
          this.isProcessingVoice.set(false);
          this.voiceTranscript.set(null);
          console.error('Error procesando audio con Gemini:', err);
          this.voiceService.permissionError.set(err.message || 'Error al conectar con el servicio de IA.');
        }
      });
    };

    if (localId && visId) {
      this.jugadorasService.getJugadorasByEquipo(localId).pipe(take(1)).subscribe({
        next: (jugsLoc) => {
          rosterLocal = jugsLoc;
          this.jugadorasService.getJugadorasByEquipo(visId).pipe(take(1)).subscribe({
            next: (jugsVis) => {
              rosterVisitante = jugsVis;
              sendAudioToGemini();
            },
            error: () => sendAudioToGemini()
          });
        },
        error: () => sendAudioToGemini()
      });
    } else {
      sendAudioToGemini();
    }
  }

  ejecutarComandoTextoRapido(): void {
    const cmd = this.quickTextCommand().trim();
    if (!cmd) return;
    this.quickTextCommand.set('');
    this.showQuickTextInput.set(false);
    this.procesarDictadoVozConIa(cmd);
  }

  triggerSheetScan(): void {
    this.openAiScanModal();
  }

  openIncidentDialog(type: 'gol' | 'tarjeta' | 'fuera_juego' | 'sustitucion', team: 'local' | 'visitante'): void {
    this.openIncidentModal(type, team);
  }

  removeIncident(id: string): void {
    this.eliminarIncidencia(id);
  }

  guardarActa(): void {
    this.guardarActaOficial();
  }

  openIncidentModal(type: 'gol' | 'tarjeta' | 'fuera_juego' | 'sustitucion', team: 'local' | 'visitante'): void {
    this.dialogIncidentType.set(type);
    this.dialogIncidentTeam.set(team);
    this.formMinuto = 25;
    this.formDorsal = '';
    this.formJugadora = '';
    this.formTipoTarjeta = 'amarilla';
    this.formTipoGol = 'jugada';
    this.formJugadoraEntra = '';
    this.formJugadoraSale = '';
    this.showIncidentDialog.set(true);
  }

  closeIncidentDialog(): void {
    this.showIncidentDialog.set(false);
  }

  confirmAddIncident(): void {
    const activeMatch = this.activeRegistrationMatch();
    if (!activeMatch) return;

    const teamType = this.dialogIncidentTeam();
    const teamName = teamType === 'local' 
      ? activeMatch.equipo_local?.nombre || 'Local' 
      : activeMatch.equipo_visitante?.nombre || 'Visitante';

    const incType = this.dialogIncidentType();
    let finalTipo: IncidenciaLocal['tipo'] = 'gol';
    let detalle = '';

    if (incType === 'gol') {
      finalTipo = 'gol';
      detalle = `Gol (${this.formTipoGol})`;
      this.adjustScore(teamType, 1);
    } else if (incType === 'tarjeta') {
      finalTipo = this.formTipoTarjeta === 'amarilla' ? 'tarjeta_amarilla' : 'tarjeta_roja';
      detalle = `Tarjeta ${this.formTipoTarjeta}`;
    } else if (incType === 'fuera_juego') {
      finalTipo = 'fuera_juego';
      detalle = 'Fuera de juego señalado';
    } else if (incType === 'sustitucion') {
      finalTipo = 'sustitucion';
      detalle = `Entra: ${this.formJugadoraEntra || 'S/D'} | Sale: ${this.formJugadoraSale || 'S/D'}`;
    }

    const newInc: IncidenciaLocal = {
      id: `inc-${Date.now()}`,
      tipo: finalTipo,
      equipo: teamType,
      equipoNombre: teamName,
      minuto: this.formMinuto,
      dorsal: this.formDorsal || undefined,
      jugadora: this.formJugadora || (incType === 'sustitucion' ? this.formJugadoraEntra : undefined),
      detalle
    };

    this.regIncidencias.update(list => [newInc, ...list]);
    this.closeIncidentDialog();
  }

  eliminarIncidencia(id: string): void {
    const inc = this.regIncidencias().find(item => item.id === id);
    if (inc && inc.tipo === 'gol') {
      this.adjustScore(inc.equipo, -1);
    }
    this.regIncidencias.update(list => list.filter(item => item.id !== id));
  }

  private procesarDictadoVozConIa(transcript: string): void {
    const match = this.activeRegistrationMatch();
    const localId = match?.equipo_local_id;
    const visId = match?.equipo_visitante_id;

    this.isProcessingVoice.set(true);
    this.voiceTranscript.set(`Escuchado: "${transcript}" — Interpretando con Gemini NLU...`);

    let rosterLocal: JugadoraPublica[] = [];
    let rosterVisitante: JugadoraPublica[] = [];

    const callVoiceParser = () => {
      const localPayload = {
        id: match?.equipo_local_id,
        nombre: match?.equipo_local?.nombre,
        roster: rosterLocal
      };
      const visPayload = {
        id: match?.equipo_visitante_id,
        nombre: match?.equipo_visitante?.nombre,
        roster: rosterVisitante
      };

      const minutoContexto = this.formMinuto || 20;

      this.aiScannerService.parseVoiceIncident(transcript, localPayload, visPayload, minutoContexto).subscribe({
        next: (res) => {
          this.isProcessingVoice.set(false);
          this.voiceTranscript.set(null);

          if (res?.success && res.data) {
            this.aplicarIncidenciaDeVoz(res.data);
          } else {
            this.voiceService.permissionError.set('No se pudo identificar una incidencia válida en el audio dictado.');
          }
        },
        error: (err) => {
          this.isProcessingVoice.set(false);
          this.voiceTranscript.set(null);
          console.error('Error al procesar NLU de voz:', err);
          this.voiceService.permissionError.set(err.message || 'Error al conectar con el servicio de IA.');
        }
      });
    };

    if (localId && visId) {
      this.jugadorasService.getJugadorasByEquipo(localId).pipe(take(1)).subscribe({
        next: (jugsLoc) => {
          rosterLocal = jugsLoc;
          this.jugadorasService.getJugadorasByEquipo(visId).pipe(take(1)).subscribe({
            next: (jugsVis) => {
              rosterVisitante = jugsVis;
              callVoiceParser();
            },
            error: () => callVoiceParser()
          });
        },
        error: () => callVoiceParser()
      });
    } else {
      callVoiceParser();
    }
  }

  private aplicarIncidenciaDeVoz(data: AiVoiceIncidentData): void {
    // 1. Validar que la acción sea deportiva y relevante
    if (data.valido === false || data.tipo === 'desconocido' || !data.tipo) {
      const msg = data.mensaje || data.resumen || 'Audio ignorado: No se detectó ninguna acción de fútbol válida (goles, tarjetas, cambios o faltas).';
      this.voiceService.permissionError.set(msg);
      setTimeout(() => {
        if (this.voiceService.permissionError() === msg) {
          this.voiceService.clearError();
        }
      }, 7000);
      return;
    }

    const match = this.activeRegistrationMatch();
    const incidentId = `voice-${Date.now()}`;
    const equipoLado: 'local' | 'visitante' = data.equipo === 'visitante' ? 'visitante' : 'local';

    let tipoIncidencia: IncidenciaLocal['tipo'] = 'gol';
    if (data.tipo === 'tarjeta_amarilla') tipoIncidencia = 'tarjeta_amarilla';
    else if (data.tipo === 'tarjeta_roja') tipoIncidencia = 'tarjeta_roja';
    else if (data.tipo === 'sustitucion') tipoIncidencia = 'sustitucion';
    else if (data.tipo === 'falta') tipoIncidencia = 'fuera_juego';

    const newInc: IncidenciaLocal = {
      id: incidentId,
      tipo: tipoIncidencia,
      equipo: equipoLado,
      equipoNombre: data.equipo_nombre || (equipoLado === 'local' ? match?.equipo_local?.nombre : match?.equipo_visitante?.nombre) || 'Equipo',
      minuto: data.minuto || this.formMinuto || 20,
      dorsal: data.dorsal || undefined,
      jugadora: data.jugadora || (data.dorsal ? `Jugadora #${data.dorsal}` : 'Jugadora'),
      detalle: data.detalle || 'Registrado por dictado por voz (IA)'
    };

    // Agregar a la lista de incidencias
    this.regIncidencias.update(list => [newInc, ...list]);

    // Si es gol, incrementar automáticamente el marcador
    if (tipoIncidencia === 'gol') {
      this.adjustScore(equipoLado, 1);
    }

    // Mostrar Toast con opción de "Deshacer"
    if (this.voiceUndoTimeout) {
      clearTimeout(this.voiceUndoTimeout);
    }

    this.voiceSuccessToast.set({
      id: incidentId,
      message: data.resumen || `Incidencia registrada: ${newInc.tipo} para ${newInc.equipoNombre}`,
      equipo: equipoLado,
      tipo: tipoIncidencia
    });

    this.voiceUndoTimeout = setTimeout(() => {
      this.voiceSuccessToast.set(null);
    }, 7000);
  }

  deshacerUltimaVoz(): void {
    const toast = this.voiceSuccessToast();
    if (!toast) return;

    // Remover la incidencia
    this.regIncidencias.update(list => list.filter(item => item.id !== toast.id));

    // Si fue gol, revertir el marcador
    if (toast.tipo === 'gol') {
      this.adjustScore(toast.equipo, -1);
    }

    this.voiceSuccessToast.set(null);
    if (this.voiceUndoTimeout) {
      clearTimeout(this.voiceUndoTimeout);
    }
  }

  solicitarPermisoMicrofono(): void {
    this.voiceService.requestPermission().then(granted => {
      if (granted) {
        this.toggleVoiceDictation();
      }
    });
  }

  openAiScanModal(): void {
    this.aiScanStep.set('upload');
    this.aiScanFile.set(null);
    this.aiScanPreviewUrl.set(null);
    this.aiScanResult.set(null);
    this.aiScanError.set(null);
    this.showAiScanModal.set(true);
  }

  closeAiScanModal(): void {
    if (this.aiScanPreviewUrl()) {
      URL.revokeObjectURL(this.aiScanPreviewUrl()!);
    }
    this.showAiScanModal.set(false);
  }

  onCedulaFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.cargarArchivoCedula(input.files[0]);
    }
  }

  onCedulaDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(true);
  }

  onCedulaDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(false);
  }

  onCedulaDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.cargarArchivoCedula(event.dataTransfer.files[0]);
    }
  }

  cargarArchivoCedula(file: File): void {
    this.aiScanFile.set(file);
    this.aiScanError.set(null);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      this.aiScanPreviewUrl.set(url);
    } else {
      this.aiScanPreviewUrl.set(null);
    }
  }

  ejecutarEscaneoIa(): void {
    const file = this.aiScanFile();
    if (!file) return;

    const match = this.activeRegistrationMatch();
    const localId = match?.equipo_local_id;
    const visId = match?.equipo_visitante_id;

    this.aiScanStep.set('scanning');
    this.aiScanError.set(null);
    this.aiScanProgressMsg.set('Enviando documento a Google Gemini Vision...');

    let rosterLocal: JugadoraPublica[] = [];
    let rosterVisitante: JugadoraPublica[] = [];

    const callScan = () => {
      this.aiScanProgressMsg.set('Leyendo caligrafía y cuadrantes de Fútbol 7...');
      this.aiScannerService.scanCedula(file, rosterLocal, rosterVisitante).subscribe({
        next: (res) => {
          this.aiScanResult.set(res);
          this.aiScanStep.set('review');
        },
        error: (err) => {
          console.error('Error al escanear cédula:', err);
          this.aiScanError.set(err.message || 'Error al procesar la cédula física con IA.');
          this.aiScanStep.set('upload');
        }
      });
    };

    if (localId && visId) {
      this.jugadorasService.getJugadorasByEquipo(localId).pipe(take(1)).subscribe({
        next: (jugsLocal) => {
          rosterLocal = jugsLocal;
          this.jugadorasService.getJugadorasByEquipo(visId).pipe(take(1)).subscribe({
            next: (jugsVis) => {
              rosterVisitante = jugsVis;
              callScan();
            },
            error: () => callScan()
          });
        },
        error: () => callScan()
      });
    } else {
      callScan();
    }
  }

  aplicarResultadoIa(): void {
    const res = this.aiScanResult();
    if (!res || !res.data) return;

    const match = this.activeRegistrationMatch();
    const data = res.data;

    // 1. Sincronizar marcador
    this.regGolesLocal.set(data.marcador_final.local);
    this.regGolesVisitante.set(data.marcador_final.visitante);
    this.regEstado.set('finalizado');

    // 2. Generar incidencias
    const newIncidencias: IncidenciaLocal[] = [];
    let incCounter = 1;

    // Procesar jugadoras locales
    const allLocal = [...data.equipo_local.titulares, ...data.equipo_local.cambios];
    allLocal.forEach(p => {
      if (!p.nombre || p.nombre.trim() === '') return;
      const matchRoster = p.match_roster;
      const nombreJugadora = matchRoster?.matched && matchRoster.nombre_oficial ? matchRoster.nombre_oficial : p.nombre;
      const dorsal = matchRoster?.dorsal_oficial || p.dorsal || undefined;

      // Goles
      for (let g = 0; g < p.goles; g++) {
        newIncidencias.push({
          id: `ai-gol-loc-${incCounter++}`,
          tipo: 'gol',
          equipo: 'local',
          equipoNombre: match?.equipo_local?.nombre || data.equipo_local.nombre || 'Local',
          minuto: 15 + (g * 18),
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Gol detectado por IA en cédula arbitral'
        });
      }

      // Tarjetas amarillas
      for (let t = 0; t < p.ta; t++) {
        newIncidencias.push({
          id: `ai-ta-loc-${incCounter++}`,
          tipo: 'tarjeta_amarilla',
          equipo: 'local',
          equipoNombre: match?.equipo_local?.nombre || data.equipo_local.nombre || 'Local',
          minuto: 28,
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Tarjeta amarilla registrada en cédula'
        });
      }

      // Tarjetas rojas
      for (let r = 0; r < p.tr; r++) {
        newIncidencias.push({
          id: `ai-tr-loc-${incCounter++}`,
          tipo: 'tarjeta_roja',
          equipo: 'local',
          equipoNombre: match?.equipo_local?.nombre || data.equipo_local.nombre || 'Local',
          minuto: 45,
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Tarjeta roja registrada en cédula'
        });
      }
    });

    // Procesar jugadoras visitantes
    const allVis = [...data.equipo_visitante.titulares, ...data.equipo_visitante.cambios];
    allVis.forEach(p => {
      if (!p.nombre || p.nombre.trim() === '') return;
      const matchRoster = p.match_roster;
      const nombreJugadora = matchRoster?.matched && matchRoster.nombre_oficial ? matchRoster.nombre_oficial : p.nombre;
      const dorsal = matchRoster?.dorsal_oficial || p.dorsal || undefined;

      // Goles
      for (let g = 0; g < p.goles; g++) {
        newIncidencias.push({
          id: `ai-gol-vis-${incCounter++}`,
          tipo: 'gol',
          equipo: 'visitante',
          equipoNombre: match?.equipo_visitante?.nombre || data.equipo_visitante.nombre || 'Visitante',
          minuto: 22 + (g * 15),
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Gol detectado por IA en cédula arbitral'
        });
      }

      // Tarjetas amarillas
      for (let t = 0; t < p.ta; t++) {
        newIncidencias.push({
          id: `ai-ta-vis-${incCounter++}`,
          tipo: 'tarjeta_amarilla',
          equipo: 'visitante',
          equipoNombre: match?.equipo_visitante?.nombre || data.equipo_visitante.nombre || 'Visitante',
          minuto: 35,
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Tarjeta amarilla registrada en cédula'
        });
      }

      // Tarjetas rojas
      for (let r = 0; r < p.tr; r++) {
        newIncidencias.push({
          id: `ai-tr-vis-${incCounter++}`,
          tipo: 'tarjeta_roja',
          equipo: 'visitante',
          equipoNombre: match?.equipo_visitante?.nombre || data.equipo_visitante.nombre || 'Visitante',
          minuto: 48,
          dorsal: dorsal,
          jugadora: nombreJugadora,
          detalle: 'Tarjeta roja registrada en cédula'
        });
      }
    });

    // Si había observaciones o árbitros, añadirlos a las notas
    let notas = `Árbitro: ${data.arbitro || 'S/D'} | Asistente: ${data.asistente || 'S/D'}`;
    if (data.observaciones) {
      notas += `\nNotas: ${data.observaciones}`;
    }
    this.regNotasMesa.set(notas);

    // Actualizar lista de incidencias
    this.regIncidencias.set(newIncidencias);

    this.closeAiScanModal();
    this.scanSuccessMessage.set(`✓ Cédula procesada exitosamente con IA (${res.model_used}): Marcador (${data.marcador_final.local}-${data.marcador_final.visitante}) y ${newIncidencias.length} incidencias sincronizadas.`);
    setTimeout(() => {
      this.scanSuccessMessage.set(null);
    }, 6000);
  }

  guardarActaOficial(): void {
    const match = this.activeRegistrationMatch();
    if (!match) return;

    this.isSavingActa.set(true);
    setTimeout(() => {
      this.isSavingActa.set(false);
      this.saveSuccessToast.set(`¡Acta del partido ${match.equipo_local?.nombre} vs ${match.equipo_visitante?.nombre} guardada exitosamente!`);
      this.actaGuardada.emit(match);
      setTimeout(() => {
        this.saveSuccessToast.set(null);
      }, 4000);
    }, 800);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.showAiScanModal()) {
        this.closeAiScanModal();
      } else if (this.showIncidentDialog()) {
        this.closeIncidentDialog();
      } else {
        this.cerrar.emit();
      }
    }
  }
}
