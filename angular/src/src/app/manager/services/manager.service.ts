import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  constructor(private http: HttpClient) { }
  private getHeaders(): HttpHeaders {
    if (typeof localStorage !== 'undefined') {
      // localStorage is available
      const token = localStorage.getItem('token');
      if (token) {
        return new HttpHeaders({
          Authorization: `Token ${token}`,
        });
      }
    }
    // Handle the case where localStorage is not available
    return new HttpHeaders(); // Or throw an error, or handle in another way.
  }
  private selectedRequestId!: number;
  setRequestId(id: number) {
    this.selectedRequestId = id;
  }

  getRequestId(): number {
    return this.selectedRequestId;
  }
  getData():Observable<any>{
    const headers = this.getHeaders()
      return this.http.get('http://127.0.0.1:8000/tms/manager/home',{headers})
    }
  getRequestData(request_id:number):Observable<any>{
    const headers = this.getHeaders();
    return this.http.get(`http://127.0.0.1:8000/tms/manager/request/${request_id}`, {headers});
  }

  requestMoreInfo(request_id: number, additional_request: string): Observable<any> {
    const headers = this.getHeaders();
    const body = { 
      action: "request_more_info", 
      note: additional_request 
    };
    return this.http.put(`http://127.0.0.1:8000/tms/manager/process_request/${request_id}`, body, { headers });
  }
  process_manager_request(request_id: number, action: "approve" | "reject", manager_note: string): Observable<any> {
    const headers = this.getHeaders();
    const body = { 
      action: action, 
      note: manager_note 
    };
    return this.http.put(`http://127.0.0.1:8000/tms/manager/process_request/${request_id}`, body, { headers });
}
getManagerRequestHistory(filters: any): Observable<any> {
  const headers = this.getHeaders();

  return this.http.post('http://127.0.0.1:8000/tms/manager/home', filters, {headers});
}
}
