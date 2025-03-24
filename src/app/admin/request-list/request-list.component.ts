import { Component } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.css'
})
export class RequestListComponent {
  request_data: any=[];
  filterForm: FormGroup;
  admin_note_form:FormGroup; 
  selectedRequestId: number | null = null;
  selectedRequest: any = null; 


  constructor(private adminService: AdminService, private authService: AuthService, private router: Router){
    this.filterForm = new FormGroup({
          status: new FormControl(''),
          from_date: new FormControl(''),
          to_date: new FormControl(''),
          search:new FormControl(''),
          sort_by:new FormControl('')
        });
      this.admin_note_form=new FormGroup({
        admin_note:new FormControl('',Validators.required)
      })
    
  }
  ngOnInit() {
    this.fetchRequests();
  }
  fetchRequests() {
    const filters = this.filterForm.value;
    this.adminService.getAdminRequestHistory(filters).subscribe({
      next: (data) => {
        console.log('API Response:', data);
        this.request_data = data;
        if (Array.isArray(data)) {
          this.request_data = data;
        } else {
          alert(data.message || "No requests found.");
          this.filterForm.reset(); // Reset the filters
          this.fetchRequests(); // Fetch all data again
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
  applyFilters() {
    this.fetchRequests();
  }
  resetFilters() {
    this.filterForm.reset(); 
    this.fetchRequests();
  }
  setSort(value: string) {
    this.filterForm.patchValue({ sort_by: value });
    const filters = this.filterForm.value;
    this.adminService.getAdminRequestHistory(filters).subscribe({
      next: (data) => {
        console.log('API Response:', data);
        this.request_data = data;
        console.log("Selected Sort:", this.filterForm.get('sort_by')?.value);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  openCloseModal(requestId: number) {
    this.selectedRequestId = requestId; // Store the request ID
  }
  openModal(request: any) {
    this.selectedRequestId = request.request_id; // Store the request ID
    this.fetchRequestDetails(request.request_id);
  }
  
  closeRequest(requestId: number|null) {
    if (!requestId) return;
  
    this.adminService.closeRequest(requestId).subscribe({
      next: (response) => {
        console.log(response.message);
        alert("Request has been closed successfully!");
        this.selectedRequestId = null; // Clear selected request
        this.fetchRequests(); // Refresh request list after closing
      },
      error: (error) => {
        console.error("Error closing request:", error);
        alert(error.error?.error || "Failed to close request");
      }
    });
  }
  admin_request_note() {
    if (this.admin_note_form.invalid) {
      console.error("Admin note is required.");
      return;
    }
    const adminNote = this.admin_note_form.value.admin_note;
    this.adminService.admin_request_note(this.selectedRequestId, adminNote).subscribe({
      next: (response) => {
        console.log("Request submitted successfully:", response);
        alert("Request submitted successfully!");
        this.admin_note_form.reset(); // Reset form after submission
        this.selectedRequestId = null; // Clear selected request
      },
      error: (error) => {
        console.error("Error submitting request:", error);
      }
    });
  }
  fetchRequestDetails(requestId: number) {
    this.adminService.admin_view_request(requestId).subscribe({
      next: (response) => {
        this.selectedRequest = response;
        console.log("Fetched Request Details:", this.selectedRequest); // Debugging
      },
      error: (error) => {
        console.error("Error fetching request details:", error);
      }
    });
  }
  
  
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
