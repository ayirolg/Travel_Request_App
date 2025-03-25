import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-employee-home',
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css'
})
export class EmployeeHomeComponent implements OnInit{
  request_data: any[] = [];  // Initialize as an array
  requestId!: number;
  selectedRequest:number | null =null 
  employeeResponse= '';
  employee_response=new FormGroup({
    to_manager : new FormControl('',Validators.required),
    to_admin : new FormControl('')
  });
  constructor(private employeeService: EmployeeService,private router: Router, private authService: AuthService ) {} 

  ngOnInit() {
    this.employeeService.getData().subscribe({
      next: (data) => {
        console.log('API Response:', data);
        this.request_data = data;  // Assign API data directly
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('Data fetch completed.');
      }
    });
  }
  getSelectedRequest() {
    return this.request_data.find(req => req.request_id === this.selectedRequest);
  }
  openModal(request_id: number) {
    this.selectedRequest = request_id;
    console.log("Selected Request ID:", this.selectedRequest);
  }
  cancel_fn(request_id:number):void{
    this.selectedRequest=request_id
    console.log(this.selectedRequest)
  }
  onModalClose() {
    window.location.reload(); 
  }
  view_fn(request_id:number):void{
    this.selectedRequest=request_id
    console.log(this.selectedRequest)
  }
  request_edit(request_id:number):void{
    this.employeeService.setRequestId(request_id);
    this.router.navigate([`/employees/edit_request`, request_id]);
  }
  confirm_cancel(): void {
    if (this.selectedRequest !== null) {
      this.employeeService.cancel_request(this.selectedRequest).subscribe({
        next: (response) => {
          console.log('Request cancelled successfully:', response);
            this.request_data = this.request_data.map(req => {
            if (req.request_id === this.selectedRequest) {
              return { ...req, employee_status: 'Cancelled' }; 
            }
            return req;
          });
          this.selectedRequest = null; 
        },
        error: (error) => {
          console.error('Error cancelling request', error);
        }
      });
    }
  }

  submitResponse(): void {
    console.log("Selected Request ID:", this.selectedRequest);
    console.log("Form Controls:", this.employee_response.controls);
    console.log("to_manager Value:", this.employee_response.get('to_manager')?.value);
    console.log("Form Validity:", this.employee_response.valid);
  
    if (this.employee_response.valid && this.selectedRequest !== null) {
      const requestId = this.selectedRequest;
      const toManager = this.employee_response.get('to_manager')?.value;
      
      const requestBody = {
        employee_response_to_manager: toManager
      };
      console.log("Submitting Response:", requestBody);

      this.employeeService.employee_response_manager(requestId, requestBody).subscribe({
        next: (response) => {
          console.log('Response submitted:', response);
          this.router.navigate(['/employees/home']); 
        },
        error: (error) => console.error('Error submitting response:', error)
      });
    } else {
      console.error('Form is invalid or no request selected');
    }
  } 
  submitAdminResponse(): void {
    console.log("Selected Request ID:", this.selectedRequest);
    console.log("Form Controls:", this.employee_response.controls);
    console.log("to_admin Value:", this.employee_response.get('to_admin')?.value);
    console.log("Form Validity:", this.employee_response.valid);
  
    if (this.employee_response.get('to_admin')?.valid && this.selectedRequest !== null) {
      const requestId = this.selectedRequest;
      const toAdmin = this.employee_response.get('to_admin')?.value;
      
      const requestBody = {
        employee_response: toAdmin
      };
      console.log("Submitting Response:", requestBody);

      this.employeeService.employee_response_admin(requestId, requestBody).subscribe({
        next: (response) => {
          console.log('Response submitted:', response);
          this.router.navigate(['/employees/home']); 
        },
        error: (error) => console.error('Error submitting response:', error)
      });
    } else {
      console.error('Form is invalid or no request selected');
    }
  } 
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}