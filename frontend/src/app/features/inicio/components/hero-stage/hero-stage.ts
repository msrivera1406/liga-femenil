import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-stage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-stage.html',
  styleUrls: ['./hero-stage.scss']
})
export class HeroStageComponent implements AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);

  @ViewChild('scrollTrack') scrollTrack!: ElementRef<HTMLElement>;
  @ViewChild('scrollCanvas') scrollCanvas!: ElementRef<HTMLCanvasElement>;

  readonly TOTAL = 85;
  private frames: HTMLImageElement[] = [];
  private current = -1;
  private canvasW = 1920;
  private canvasH = 1080;
  private isScrollTicking = false;

  // Signal for UI Text Phases (Fase 1 Bienvenida, Fase 2 Diferenciadores)
  activePhase = signal<number>(1);

  private scrollListenerBound = () => this.onScrollThrottled();
  private resizeListenerBound = () => this.onResize();

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      this.initCanvasAndPreload();
      this.setupListeners();
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollListenerBound);
      window.removeEventListener('resize', this.resizeListenerBound);
    }
  }

  private initCanvasAndPreload(): void {
    const canvas = this.scrollCanvas?.nativeElement;
    if (!canvas) return;

    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const use4k = typeof window !== 'undefined' ? (window.innerWidth * dpr) > 2200 : false;
    const folder = use4k ? 'sin-fondo-4k-webp' : 'sin-fondo-1080p-webp';

    this.canvasW = use4k ? 3840 : 1920;
    this.canvasH = use4k ? 2160 : 1080;

    canvas.width = this.canvasW;
    canvas.height = this.canvasH;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingQuality = 'high';
    }

    const src = (i: number) => `/frames2/${folder}/frame_${String(i).padStart(3, '0')}.webp`;
    this.frames = [];
    this.current = -1;

    for (let i = 1; i <= this.TOTAL; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = src(i);
      this.frames.push(img);
    }

    if (this.frames[0]) {
      this.frames[0].onload = () => this.draw(0);
    }
  }

  private draw(index: number): void {
    if (index === this.current) return;
    const img = this.frames[index];
    if (!img) return;

    if (!img.complete) {
      img.onload = () => this.draw(index);
      return;
    }

    this.current = index;
    const canvas = this.scrollCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvasW, this.canvasH);
    ctx.drawImage(img, 0, 0, this.canvasW, this.canvasH);
  }

  private onScroll(): void {
    const track = this.scrollTrack?.nativeElement;
    if (!track) return;

    const max = track.offsetHeight - window.innerHeight;
    const scrollY = window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
    const p = Math.min(Math.max((scrollY - track.offsetTop) / max, 0), 1);

    this.draw(Math.round(p * (this.TOTAL - 1)));

    const phase = p < 0.38 ? 1 : 2;
    if (this.activePhase() !== phase) {
      this.ngZone.run(() => {
        this.activePhase.set(phase);
      });
    }
  }

  private onScrollThrottled(): void {
    if (!this.isScrollTicking) {
      requestAnimationFrame(() => {
        this.onScroll();
        this.isScrollTicking = false;
      });
      this.isScrollTicking = true;
    }
  }

  private onResize(): void {
    this.initCanvasAndPreload();
    this.onScroll();
  }

  private setupListeners(): void {
    window.addEventListener('scroll', this.scrollListenerBound, { passive: true });
    window.addEventListener('resize', this.resizeListenerBound, { passive: true });

    this.onScroll();
  }
}
