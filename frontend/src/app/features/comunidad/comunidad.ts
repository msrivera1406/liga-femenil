import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunidadHeroComponent } from './components/comunidad-hero/comunidad-hero';
import { ComunidadEquiposComponent } from './components/comunidad-equipos/comunidad-equipos';
import { ComunidadFormularioComponent } from './components/comunidad-formulario/comunidad-formulario';
import { ComunidadDestacadasComponent } from './components/comunidad-destacadas/comunidad-destacadas';
import { LandingFooterComponent } from '../inicio/components/landing-footer/landing-footer';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [
    CommonModule,
    ComunidadHeroComponent,
    ComunidadEquiposComponent,
    ComunidadFormularioComponent,
    ComunidadDestacadasComponent,
    LandingFooterComponent
  ],
  templateUrl: './comunidad.html',
  styleUrls: ['./comunidad.scss']
})
export class ComunidadComponent {}
