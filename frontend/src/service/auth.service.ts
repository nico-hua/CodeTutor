import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private apiUrl = 'http://47.116.195.16:8080/api/user/getLocalUserName';
  
  constructor(private http: HttpClient) {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'token': `${token}`
      });

      this.http.get<any>(this.apiUrl, { headers }).subscribe({
        next: (response) => {
          if (response.code==200) {
            this.isLoggedInSubject.next(true);
          } else {
            this.isLoggedInSubject.next(false);
          }
        },
        error: () => {
          this.isLoggedInSubject.next(false);
        }
      });
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  login(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  getUserName(): Observable<string> {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({
        'token': `${token}`
      });

      return this.http.get<any>(this.apiUrl, { headers }).pipe(
        map(response => response.data.username)
      );
    } else {
      return of('');
    }
  }
}