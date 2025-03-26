import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private selectedType= '';
  constructor(private http: HttpClient, private auth:AuthService) { }
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
  getAdminRequestHistory(filters: any): Observable<any> {
      const headers = this.getHeaders();
    
      return this.http.post('http://127.0.0.1:8000/tms/admin/home', filters, {headers});
    }

  closeRequest(request_id:number){
    const headers = this.getHeaders();
    
      return this.http.put<any>(`http://127.0.0.1:8000/tms/admin/close_request/${request_id}`,{},{headers});
  }
  admin_request_note(request_id:number |null ,admin_note:string){
    const headers = this.getHeaders();
    return this.http.put<any>(`http://127.0.0.1:8000/tms/admin/request_additional_info/${request_id}`,{admin_note},{headers});
  }
  admin_view_request(request_id:number){
    const headers = this.getHeaders();
    return this.http.get<any>(`http://127.0.0.1:8000/tms/admin/request/${request_id}`,{headers});
  
  }
  setSelectedType(type: string) {
    this.selectedType = type;
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:8000/tms/admin/get_managers`);
  }
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`http://127.0.0.1:8000/tms/departments`);
  }
  getCount(): Observable<any[]>{
    const headers = this.getHeaders();
    return this.http.get<any[]>(`http://127.0.0.1:8000/tms/count`,{headers});
  }
  createEntity(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post('http://127.0.0.1:8000/tms/admin/new_entity', data,{headers});
  }
  createEmployee(employeeData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`http://127.0.0.1:8000/tms/admin/new_entity`, employeeData, {headers} );
  }
  getEntityList(type: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`http://127.0.0.1:8000/tms/admin/view-list?type=${type}`, { headers });
  }
  
}
