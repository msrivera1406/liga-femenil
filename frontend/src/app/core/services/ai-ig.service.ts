import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IgContentRequest, IgContentResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AiIgService {
  private http = inject(HttpClient);
  private aiBaseUrl = environment.aiApiUrl || 'http://localhost:5000/api';

  generateContent(req: IgContentRequest): Observable<IgContentResponse> {
    return this.http.post<IgContentResponse>(`${this.aiBaseUrl}/ig/generate-content`, req).pipe(
      catchError(err => {
        console.error('Error al generar contenido IG con IA:', err);
        return throwError(() => new Error(err.error?.error || 'No se pudo conectar con el servicio de IA de Instagram.'));
      })
    );
  }
}
