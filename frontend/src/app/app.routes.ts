import { Routes } from '@angular/router';
import { rolGuard } from './core/guards/rol.guard';

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
    path: 'jornadas',
    loadComponent: () => import('./features/jornadas/jornadas').then(m => m.JornadasComponent)
  },
  {
    path: 'posiciones',
    loadComponent: () => import('./features/posiciones/posiciones').then(m => m.PosicionesComponent)
  },
  {
    path: 'comunidad',
    loadComponent: () => import('./features/comunidad/comunidad').then(m => m.ComunidadComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [rolGuard('superadmin')],
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent)
  },
  {
    path: 'representante',
    canActivate: [rolGuard('capitana')],
    loadComponent: () => import('./features/representante/representante').then(m => m.RepresentanteComponent)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
