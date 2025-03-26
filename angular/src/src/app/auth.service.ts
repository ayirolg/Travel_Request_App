import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let token = null;
    if (typeof localStorage !== 'undefined') {
      token = localStorage.getItem('token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>('http://127.0.0.1:8000/tms/login', credentials);
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    return this.http.post('http://127.0.0.1:8000/tms/logout', {}, { headers });
  }
}