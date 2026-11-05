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
import { TorneoService, EquiposService, JugadorasService, EntrenadoresService } from '../../core/services';
import { GhostAvatarComponent } from '../../shared/components/ghost-avatar/ghost-avatar';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, GhostAvatarComponent],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent implements AfterViewInit, OnDestroy {
  private torneoService = inject(TorneoService);
  private equiposService = inject(EquiposService);
  private jugadorasService = inject(JugadorasService);
  private entrenadoresService = inject(EntrenadoresService);
  private ngZone = inject(NgZone);

  posiciones$ = this.torneoService.getPosiciones();
  jornadaActual$ = this.torneoService.getJornadaActual();
  equipos$ = this.equiposService.getEquipos();
  jugadorasBolsa$ = this.jugadorasService.getBolsaIndependientes();
  entrenadores$ = this.entrenadoresService.getEntrenadores();

  @ViewChild('scrollTrack') scrollTrack!: ElementRef<HTMLElement>;
  @ViewChild('scrollCanvas') scrollCanvas!: ElementRef<HTMLCanvasElement>;

  readonly TOTAL_FRAMES = 120;
  private frames: HTMLImageElement[] = [];
  private currentProgress = 0;
  private targetProgress = 0;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Signals for UI & Text Phases
  loadedCount = signal<number>(0);
  isReady = signal<boolean>(false);
  activePhase = signal<number>(1);
  scrollPct = signal<number>(0);
  pinState = signal<'top' | 'fixed' | 'bottom'>('top');

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    // Run frame preload & canvas animation outside Angular zone for max 60/120fps performance
    this.ngZone.runOutsideAngular(() => {
      this.initCanvasAndPreload();
      this.setupListeners();
      this.startRenderLoop();
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScrollBound);
      document.removeEventListener('scroll', this.onScrollBound);
      window.removeEventListener('resize', this.onResizeBound);
    }
  }

  private onScrollBound = () => this.handleScroll();
  private onResizeBound = () => this.handleResize();

  private initCanvasAndPreload(): void {
    this.handleResize();

    // 1. Immediately load frame 0 with absolute path /frames/...
    const firstImg = new Image();
    firstImg.src = '/frames/frame_000.webp';
    firstImg.onload = () => {
      this.frames[0] = firstImg;
      this.renderFrame(0);
      this.ngZone.run(() => {
        this.isReady.set(true);
      });
    };
    firstImg.onerror = () => {
      firstImg.src = '/frames/frame_000.png';
      firstImg.onload = () => {
        this.frames[0] = firstImg;
        this.renderFrame(0);
      };
    };

    // 2. Preload all remaining frames in parallel
    let loaded = 0;
    for (let i = 0; i < this.TOTAL_FRAMES; i++) {
      const img = new Image();
      const padIndex = i.toString().padStart(3, '0');
      img.src = `/frames/frame_${padIndex}.webp`;

      img.onload = () => {
        this.frames[i] = img;
        loaded++;
        if (loaded % 10 === 0 || loaded === this.TOTAL_FRAMES) {
          this.ngZone.run(() => {
            this.loadedCount.set(loaded);
          });
          // Immediately refresh current frame
          const currentIdx = Math.min(
            this.TOTAL_FRAMES - 1,
            Math.max(0, Math.round(this.currentProgress * (this.TOTAL_FRAMES - 1)))
          );
          this.renderFrame(currentIdx);
        }
      };

      img.onerror = () => {
        const fallback = new Image();
        fallback.src = `/frames/frame_${padIndex}.png`;
        fallback.onload = () => {
          this.frames[i] = fallback;
          loaded++;
        };
      };
    }
  }

  private setupListeners(): void {
    window.addEventListener('scroll', this.onScrollBound, { passive: true });
    document.addEventListener('scroll', this.onScrollBound, { passive: true });
    window.addEventListener('resize', this.onResizeBound, { passive: true });

    // Initial check
    this.handleScroll();
  }

  private handleResize(): void {
    const canvas = this.scrollCanvas?.nativeElement;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || document.documentElement.clientWidth || 1200;
    const h = window.innerHeight || document.documentElement.clientHeight || 800;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    const frameIdx = Math.min(
      this.TOTAL_FRAMES - 1,
      Math.max(0, Math.round(this.currentProgress * (this.TOTAL_FRAMES - 1)))
    );
    this.renderFrame(frameIdx);
  }

  private handleScroll(): void {
    const track = this.scrollTrack?.nativeElement;
    if (!track) return;

    const viewportH = window.innerHeight || 800;
    const trackH = track.offsetHeight || (viewportH * 3.8);
    const maxScroll = Math.max(1, trackH - viewportH);

    // Reliable scroll distance across all browsers and devices
    const scrollY = window.pageYOffset ?? window.scrollY ?? document.documentElement.scrollTop ?? document.body.scrollTop ?? 0;
    const trackTop = track.offsetTop || 0;
    const relativeScroll = scrollY - trackTop;

    // Progress clamped from 0.0 to 1.0
    const progress = Math.max(0, Math.min(1, relativeScroll / maxScroll));
    this.targetProgress = progress;

    // Deterministic Pinning: Fixed during scroll range, absolute at bottom once complete
    let newPinState: 'top' | 'fixed' | 'bottom';
    if (relativeScroll <= 0) {
      newPinState = 'top';
    } else if (relativeScroll >= maxScroll) {
      newPinState = 'bottom';
    } else {
      newPinState = 'fixed';
    }

    if (this.pinState() !== newPinState) {
      this.ngZone.run(() => {
        this.pinState.set(newPinState);
      });
    }

    // 4 Narrative phases
    let phase = 1;
    if (progress < 0.28) {
      phase = 1;
    } else if (progress < 0.58) {
      phase = 2;
    } else if (progress < 0.85) {
      phase = 3;
    } else {
      phase = 4;
    }

    const pct = Math.round(progress * 100);
    if (this.activePhase() !== phase || Math.abs(this.scrollPct() - pct) >= 2) {
      this.ngZone.run(() => {
        this.activePhase.set(phase);
        this.scrollPct.set(pct);
      });
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.isDestroyed) return;

      // Smooth lerp damping (0.22) for responsive yet silky-smooth motion
      const diff = this.targetProgress - this.currentProgress;
      if (Math.abs(diff) > 0.0002) {
        this.currentProgress += diff * 0.22;
      } else {
        this.currentProgress = this.targetProgress;
      }

      const frameIdx = Math.min(
        this.TOTAL_FRAMES - 1,
        Math.max(0, Math.round(this.currentProgress * (this.TOTAL_FRAMES - 1)))
      );

      this.renderFrame(frameIdx);
      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  private getNearestLoadedFrame(index: number): HTMLImageElement | null {
    if (this.frames[index]?.complete && this.frames[index]?.naturalWidth > 0) {
      return this.frames[index];
    }
    // Search backward
    for (let i = index - 1; i >= 0; i--) {
      if (this.frames[i]?.complete && this.frames[i]?.naturalWidth > 0) {
        return this.frames[i];
      }
    }
    // Search forward
    for (let i = index + 1; i < this.TOTAL_FRAMES; i++) {
      if (this.frames[i]?.complete && this.frames[i]?.naturalWidth > 0) {
        return this.frames[i];
      }
    }
    return null;
  }

  private renderFrame(index: number): void {
    const canvas = this.scrollCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = this.getNearestLoadedFrame(index);
    if (!img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Responsive scaling (frame native is 1664 x 720)
    const imgW = img.naturalWidth || 1664;
    const imgH = img.naturalHeight || 720;
    const imgRatio = imgW / imgH;
    const canvasRatio = canvas.width / canvas.height;

    let drawW: number;
    let drawH: number;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isDesktop = canvas.width > 900 * dpr;

    if (canvasRatio > imgRatio) {
      // Wide desktop: fit to 88% of screen height
      drawH = canvas.height * 0.88;
      drawW = drawH * imgRatio;
    } else {
      // Mobile / tablet: scale width to 110% of screen
      drawW = canvas.width * 1.1;
      drawH = drawW / imgRatio;
    }

    // Offset on desktop so character sits on the right side of the text overlays
    const offsetX = isDesktop ? (canvas.width - drawW) * 0.22 : 0;

    const drawX = (canvas.width - drawW) / 2 + offsetX;
    const drawY = (canvas.height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}
