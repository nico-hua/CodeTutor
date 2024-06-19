import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-two',
  standalone: true,
  imports: [],
  templateUrl: './page-two.component.html',
  styleUrl: './page-two.component.scss'
})
export class PageTwoComponent {
  constructor(private router: Router){}

  goto(){
    this.router.navigateByUrl("debugger")
  }
}
