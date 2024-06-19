import { Injectable } from '@angular/core';
import { Response, api, baseUrl } from '../api/api';
import axios from 'axios';
import { Trace } from '../app/debugger/tracer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface TracePayload {
  code: string;
  trace: Trace[];
} 

interface Record {
  id: number;
  user_id: number;
  code: string;
  url: string;
  submittedAt: string;
}

interface ApiResponse {
  code: number;
  errorMessage: string;
  data: Record[];
}

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  constructor(private http: HttpClient) { }
  private recordUrl = 'http://47.116.195.16:8080/api/code';

  private errorHandlder(err: any) {
    console.error('Network error: ', err);
    return Promise.reject(err);
  }

  public async getTrace(code: string): Promise<Response<TracePayload | null>> {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(baseUrl + api.getCodeTrace, { code }, { headers: { token } });
      return res.data;
    } catch (err) {
      return this.errorHandlder(err);
    }
  }

  public async getTraceByUrl(url: string): Promise<Response<TracePayload | null>> {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(baseUrl + api.getCodeTraceByUrl, { url }, { headers: { token } });
      return res.data;
    } catch (err) {
      return this.errorHandlder(err);
    }
  }

  getAllRecords(): Observable<Record[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
        'token': `${token}`
      });
      return this.http.get<ApiResponse>(`${this.recordUrl}/getAllCodeRecorder?interval=0`, { headers })
      .pipe(map(response => response.data));
  }

  getWeekRecords(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
        'token': `${token}`
      });
      return this.http.get<ApiResponse>(`${this.recordUrl}/getAllCodeRecorder?interval=7`, { headers })
      .pipe(map(response => response.data));
  }

  getMonthRecords(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
        'token': `${token}`
      });
      return this.http.get<ApiResponse>(`${this.recordUrl}/getAllCodeRecorder?interval=30`, { headers })
      .pipe(map(response => response.data));
  }

  getRecordById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'token': `${token}`
    });
    return this.http.get<any>(`${this.recordUrl}/getCodeRecorderById?id=${id}`, { headers });
  }
  

  clearHistory(): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'token': `${token}`
    });
    return this.http.delete<void>(`${this.recordUrl}/clear-history`, { headers });
  }

  deleteRecord(id: number): Observable<Record[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'token': `${token}`
    });
    return this.http.delete<ApiResponse>(`${this.recordUrl}/recorder/${id}`, { headers })
    .pipe(map(response => response.data));
  }

  
}
