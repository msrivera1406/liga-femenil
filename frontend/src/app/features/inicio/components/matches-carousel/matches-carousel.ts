import {
  Component,
  AfterViewInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TorneoService } from '../../../../core/services';
import { Partido } from '../../../../core/models';

@Component({
  selector: 'app-matches-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './matches-carousel.html',
  styleUrls: ['./matches-carousel.scss']
})
export class MatchesCarouselComponent implements AfterViewInit, OnDestroy {
  private torneoService = inject(TorneoService);

  jornadaActual$ = this.torneoService.getJornadaActual();

  currentMatchSlide = signal<number>(0);
  private carouselTimer: any = null;
  private isCarouselPaused = false;
  private totalMatchSlides = 2;

  ngAfterViewInit(): void {
    this.startCarouselAutoplay();
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  getSlides(partidos: Partido[] | undefined): Partido[][] {
    if (!partidos || partidos.length === 0) return [];
    const slides: Partido[][] = [];
    for (let i = 0; i < partidos.length; i += 3) {
      slides.push(partidos.slice(i, i + 3));
    }
    this.totalMatchSlides = slides.length;
    return slides;
  }

  private startCarouselAutoplay(): void {
    if (typeof window === 'undefined') return;
    this.carouselTimer = setInterval(() => {
      if (!this.isCarouselPaused && this.totalMatchSlides > 1) {
        this.currentMatchSlide.update(curr => (curr + 1) % this.totalMatchSlides);
      }
    }, 4500);
  }

  setSlide(index: number): void {
    this.currentMatchSlide.set(index);
  }

  nextSlide(total: number): void {
    if (total <= 1) return;
    this.currentMatchSlide.update(curr => (curr + 1) % total);
  }

  prevSlide(total: number): void {
    if (total <= 1) return;
    this.currentMatchSlide.update(curr => (curr - 1 + total) % total);
  }

  pauseCarousel(): void {
    this.isCarouselPaused = true;
  }

  resumeCarousel(): void {
    this.isCarouselPaused = false;
  }
}
