import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private timerInterval: any = null;

  // Signals reactivos
  readonly isRecording = signal<boolean>(false);
  readonly recordingSeconds = signal<number>(0);
  readonly permissionDenied = signal<boolean>(false);
  readonly permissionError = signal<string | null>(null);
  readonly isSupported = signal<boolean>(true);

  constructor() {
    if (typeof window !== 'undefined') {
      const hasMedia = typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function';
      const hasRecorder = typeof window.MediaRecorder !== 'undefined';
      this.isSupported.set(hasMedia && hasRecorder);
    }
  }

  /**
   * Solicita proactivamente el permiso del micrófono al usuario
   */
  async requestPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.permissionDenied.set(false);
      this.permissionError.set(null);
      return true;
    } catch (err: any) {
      this.permissionDenied.set(true);
      this.permissionError.set(
        'Permiso de micrófono bloqueado. Haz clic en el ícono del candado en la barra de direcciones de tu navegador y cambia el micrófono a "Permitir".'
      );
      return false;
    }
  }

  /**
   * Inicia la grabación directa del micrófono mediante MediaRecorder nativo.
   * Totalmente compatible con Brave, Chrome, Firefox y Linux sin requerir
   * servicios en la nube de terceros en el navegador.
   */
  async startRecording(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.permissionError.set('Tu navegador no soporta captura de micrófono.');
      return;
    }

    if (this.isRecording()) {
      return;
    }

    this.clearError();
    this.audioChunks = [];
    this.recordingSeconds.set(0);

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Determinar el MIME type compatible soportado por el navegador
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      this.mediaRecorder = mimeType ? new MediaRecorder(this.mediaStream, { mimeType }) : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording.set(true);
        this.permissionDenied.set(false);
        this.permissionError.set(null);

        // Contador de segundos
        this.timerInterval = setInterval(() => {
          this.recordingSeconds.update(s => s + 1);
        }, 1000);
      };

      this.mediaRecorder.start(250); // Emitir chunks cada 250ms
    } catch (err: any) {
      console.error('Error al acceder al micrófono:', err);
      this.isRecording.set(false);
      this.stopTimer();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionDenied.set(true);
        this.permissionError.set(
          'Permiso de micrófono bloqueado. Haz clic en el ícono del candado en la barra de direcciones de tu navegador y cambia el micrófono a "Permitir".'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.permissionError.set('No se encontró ningún micrófono conectado en este equipo.');
      } else {
        this.permissionError.set(`No se pudo iniciar el micrófono: ${err.message || err.name}`);
      }
      throw err;
    }
  }

  /**
   * Detiene la grabación y devuelve el Blob de audio listo para enviarse a Gemini Multimodal.
   */
  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.stopTimer();

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecording.set(false);
        this.releaseStream();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording.set(false);
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const finalBlob = new Blob(this.audioChunks, { type: mimeType });
        this.releaseStream();
        resolve(finalBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording.set(false);
        this.releaseStream();
        resolve(null);
      }
    });
  }

  /**
   * Cancela la grabación sin guardar nada
   */
  cancelRecording(): void {
    this.stopTimer();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.isRecording.set(false);
    this.audioChunks = [];
    this.releaseStream();
  }

  private releaseStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.mediaStream = null;
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  clearError(): void {
    this.permissionError.set(null);
    this.permissionDenied.set(false);
  }
}
