import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertDialogComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private httpClient: HttpClient, private dialog: MatDialog,
    private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const name = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;
      const requestBody = {
        name: name,
        password: password
      };

      this.httpClient.post<any>('http://47.116.195.16:8080/api/user/login', requestBody).subscribe({
        next: (response) => {
          if(response.code==200){
            console.log(response.data.token);
            this.authService.login(response.data.token);
            localStorage.setItem('token', response.data.token);
            this.router.navigate(['/']);
          }
          else{
            this.dialog.open(AlertDialogComponent, {
              data: { message: response.errorMessage },
              width: '300px',  // 设置宽度
              height: '200px'  // 设置高度
            });
          }
        },
        error: (error) => {
          console.error(error);
          // Handle error response
        },
        complete: () => {
          console.log('Request complete');
        }
      });
    }
  }
}