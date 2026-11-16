import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InstagramPost, ApiResponse } from '../models';
import { MOCK_INSTAGRAM_POSTS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Obtiene las publicaciones recientes de la cuenta oficial de Instagram.
   * Si está en modo mock o la API de Meta no responde, devuelve los posts mockeados.
   */
  getLatestPosts(): Observable<InstagramPost[]> {
    if (environment.useMock) {
      return of(MOCK_INSTAGRAM_POSTS).pipe(delay(200));
    }
    return this.http.get<ApiResponse<InstagramPost[]>>(`${this.apiUrl}/instagram/posts.php`)
      .pipe(
        map(res => res.data),
        catchError(() => of(MOCK_INSTAGRAM_POSTS))
      );
  }
}
