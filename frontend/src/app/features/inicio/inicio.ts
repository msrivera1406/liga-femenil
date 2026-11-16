import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroStageComponent } from './components/hero-stage/hero-stage';
import { MatchesCarouselComponent } from './components/matches-carousel/matches-carousel';
import { StandingsPreviewComponent } from './components/standings-preview/standings-preview';
import { InstagramFeedComponent } from './components/instagram-feed/instagram-feed';
import { TrainersCarouselComponent } from './components/trainers-carousel/trainers-carousel';
import { LandingFooterComponent } from './components/landing-footer/landing-footer';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    HeroStageComponent,
    MatchesCarouselComponent,
    StandingsPreviewComponent,
    InstagramFeedComponent,
    TrainersCarouselComponent,
    LandingFooterComponent
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent {}
