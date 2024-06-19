import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export interface Button {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  title = 'CodeTutor';
  buttons: Button[] = [
    { label: '首页', path: '' },
    { label: '新手入门', path: 'repository'},
    { label: '代码可视化', path: 'debugger' }
  ];
  isLogged = false;
  username: string | null = null;
  recorder = {label: '学习记录', path: 'history'}
  signup = { label: '注册', path: 'signup' };
  login = { label: '登录', path: 'login' };
  

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
      if (this.isLogged) {
        this.authService.getUserName().subscribe((username: string) => {
          this.username = username;
        });
      }
    });

  }



  onClick(button: Button) {
    this.router.navigateByUrl(button.path);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
