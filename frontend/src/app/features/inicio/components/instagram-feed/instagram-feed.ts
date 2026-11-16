import {
  Component,
  ElementRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstagramService } from '../../../../core/services';

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instagram-feed.html',
  styleUrls: ['./instagram-feed.scss']
})
export class InstagramFeedComponent {
  private instagramService = inject(InstagramService);

  instagramPosts$ = this.instagramService.getLatestPosts();

  @ViewChild('igTrack') igTrack?: ElementRef<HTMLElement>;

  scrollIg(direction: 'left' | 'right'): void {
    if (!this.igTrack?.nativeElement) return;
    const container = this.igTrack.nativeElement;
    const scrollAmount = Math.max(300, container.clientWidth * 0.7);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}
