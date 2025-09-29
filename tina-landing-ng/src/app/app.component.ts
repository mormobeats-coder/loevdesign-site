import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header></app-header>
    <main id="main"></main>
  `,
  styles: [],
})
export class AppComponent {
  title = 'tina-landing-ng';
}
