import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordMatchValidator } from './password-match.validator';
import { HttpClient } from '@angular/common/http';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertDialogComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private httpClient: HttpClient, private dialog: MatDialog) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const name = this.signupForm.get('username')?.value;
      const password = this.signupForm.get('password')?.value;
      const requestBody = {
        name: name,
        password: password
      };
      this.httpClient.post<any>('http://47.116.195.16:8080/api/user/register', requestBody).subscribe({
        next: (response) => {
          if(response.code==200){
            this.router.navigate(['login']);
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
