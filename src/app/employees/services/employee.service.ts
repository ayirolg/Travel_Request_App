import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http:HttpClient, private auth:AuthService) {  }
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        Authorization: `Token ${token}`,
      });
    } else {
      return new HttpHeaders(); 
    }
  }
  
  private selectedRequestId!: number;
  setRequestId(id: number) {
    this.selectedRequestId = id;
  }

  getRequestId(): number {
    return this.selectedRequestId;
  }
  getData():Observable<any>{
    const headers = this.getHeaders();
    return this.http.get('http://127.0.0.1:8000/tms/employee/home', {headers})
  }
  getRequestData(request_id:number):Observable<any>{
    const headers = this.getHeaders();
    return this.http.get(`http://127.0.0.1:8000/tms/employee/request/${request_id}`, {headers});
  }
  cancel_request(request_id:number):Observable<any>{
    const headers = this.getHeaders();
    const body = { employee_status: 'cancelled' };
    return this.http.put(`http://127.0.0.1:8000/tms/employee/cancel_request/${request_id}`,body,{headers})
  }
  createTravelRequest(requestData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`http://127.0.0.1:8000/tms/employee/new_request`, requestData,{headers});
  }
  edit_request(request_id:number,requestData:any):Observable<any>{
    const headers = this.getHeaders();
    return this.http.put(`http://127.0.0.1:8000/tms/employee/edit_request/${request_id}`, requestData,{headers});
  }
  employee_response_manager(request_id:number,requestData:any):Observable<any>{
    const headers = this.getHeaders();
    return this.http.put(`http://127.0.0.1:8000/tms/employee/resubmit_request/${request_id}`, requestData,{headers});
  }
  employee_response_admin(request_id:number,requestData:any):Observable<any>{
    const headers = this.getHeaders();
    return this.http.put(`http://127.0.0.1:8000/tms/employee/reply_admin/${request_id}`, requestData,{headers});
  }
}
