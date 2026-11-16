import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-footer.html',
  styleUrls: ['./landing-footer.scss']
})
export class LandingFooterComponent {}
