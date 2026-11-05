import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio').then(m => m.InicioComponent)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
