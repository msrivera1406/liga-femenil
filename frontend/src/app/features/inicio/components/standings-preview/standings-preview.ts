import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TorneoService } from '../../../../core/services';

@Component({
  selector: 'app-standings-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './standings-preview.html',
  styleUrls: ['./standings-preview.scss']
})
export class StandingsPreviewComponent {
  private torneoService = inject(TorneoService);

  posiciones$ = this.torneoService.getPosiciones();
}
