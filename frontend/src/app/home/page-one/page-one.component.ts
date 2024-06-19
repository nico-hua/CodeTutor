import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-one',
  standalone: true,
  imports: [],
  templateUrl: './page-one.component.html',
  styleUrl: './page-one.component.scss'
})
export class PageOneComponent {
  constructor(private router: Router){}

  goto(){
    this.router.navigateByUrl("repository")
  }
}
