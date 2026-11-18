import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiCedulaScanResponse, AiVoiceIncidentResponse } from '../models';

// Status 0 = el navegador no pudo conectarse (el servicio Flask no está corriendo o no hay red)
function mensajeErrorIa(err: HttpErrorResponse, porDefecto: string): string {
  if (err?.status === 0) {
    return 'El servicio de inteligencia artificial no está disponible. Verifica que esté encendido e inténtalo de nuevo.';
  }
  return err?.error?.error || porDefecto;
}

@Injectable({
  providedIn: 'root'
})
export class AiScannerService {
  private http = inject(HttpClient);
  private aiBaseUrl = environment.aiApiUrl || 'http://localhost:5000/api';

  checkHealth(): Observable<any> {
    return this.http.get(`${this.aiBaseUrl}/health`).pipe(
      catchError(err => {
        console.warn('AI Service health check failed:', err);
        return throwError(() => err);
      })
    );
  }

  scanCedula(
    file: File, 
    rosterLocal: any[] = [], 
    rosterVisitante: any[] = []
  ): Observable<AiCedulaScanResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (rosterLocal && rosterLocal.length > 0) {
      formData.append('roster_local', JSON.stringify(rosterLocal));
    }

    if (rosterVisitante && rosterVisitante.length > 0) {
      formData.append('roster_visitante', JSON.stringify(rosterVisitante));
    }

    return this.http.post<AiCedulaScanResponse>(`${this.aiBaseUrl}/cedula/scan`, formData).pipe(
      catchError((err: HttpErrorResponse) => {
        const errorMsg = mensajeErrorIa(err, 'Error al conectar con el microservicio de IA.');
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  parseVoiceIncident(
    text: string,
    equipoLocal?: any,
    equipoVisitante?: any,
    minutoActual: number = 20
  ): Observable<AiVoiceIncidentResponse> {
    const payload = {
      text,
      equipo_local: equipoLocal,
      equipo_visitante: equipoVisitante,
      minuto_actual: minutoActual
    };

    return this.http.post<AiVoiceIncidentResponse>(`${this.aiBaseUrl}/voice/parse-incident`, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        const errorMsg = mensajeErrorIa(err, 'Error al interpretar el dictado por voz.');
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  processVoiceAudio(
    audioBlob: Blob,
    equipoLocal?: any,
    equipoVisitante?: any,
    minutoActual: number = 20
  ): Observable<AiVoiceIncidentResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'dictado_mesa.webm');

    if (equipoLocal) {
      formData.append('equipo_local', JSON.stringify(equipoLocal));
    }
    if (equipoVisitante) {
      formData.append('equipo_visitante', JSON.stringify(equipoVisitante));
    }
    formData.append('minuto_actual', minutoActual.toString());

    return this.http.post<AiVoiceIncidentResponse>(`${this.aiBaseUrl}/voice/process-audio`, formData).pipe(
      catchError((err: HttpErrorResponse) => {
        const errorMsg = mensajeErrorIa(err, 'Error al procesar el audio con Gemini.');
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
