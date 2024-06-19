import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { init as initMock } from '../api/mock';
import { environment } from '../environments/environment';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'codeTutor'

  ngOnInit(): void {
    if (!environment.production) {
      // initMock()
    }
  }
}
