import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterLinksComponent } from './footer-links/footer-links.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterLinksComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
})
export class AppComponent {}
