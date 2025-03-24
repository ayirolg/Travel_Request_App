import { Component } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent {
  requestId!: number;
  formData!: FormGroup
  request_data: any = {};

  constructor(private managerService: ManagerService, private route: ActivatedRoute, private router: Router, private authService: AuthService ){}

  isProcessed(): boolean {
    return this.request_data.manager_status === "Approved" ||
           this.request_data.manager_status === "Rejected" ||
           this.request_data.admin_status === "Closed"||
           this.request_data.employee_status === "cancelled";
  }
  fetchRequestData() {
    this.managerService.getRequestData(this.requestId).subscribe({
      next: (data) => {
        // console.log('Fetched Request:', data);
        this.request_data = data;
        console.log(this.request_data)
        
      },
      error: (error) => console.error('Error fetching request:', error)
    });
  }
  ngOnInit() {
    this.formData = new FormGroup({
        manager_additional_info: new FormControl('',Validators.required),
        manager_note: new FormControl(''),
            });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); 
      if (!id) {
        console.error('No Request Id Found! Redirecting');
        this.router.navigate(['/manager/home']); 
        return;
      }
      this.requestId = Number(id); 
      console.log("Fetched Request ID:", this.requestId);

      this.fetchRequestData();
    });
  }
  extraInfo() {
    if (this.formData.get('manager_additional_info')?.invalid) {
      alert("Please provide additional information.");
      return;
    }
    const requestData = this.formData.get('manager_additional_info')?.value; // Extract form values
    console.log("Submitting request:", requestData); // Debugging
  
    this.managerService.requestMoreInfo(this.requestId, requestData.manager_note).subscribe({
      next: (response) => {
        alert('Manager note submitted successfully!');
        this.router.navigate(['/manager/home']);  // Redirect to home page
      },
      error: (error) => {
        console.error('Error submitting note:', error);
        alert('Failed to submit request.');
      }
    });
  }
  

  managerNote(action: "approve" | "reject") {
    if (this.formData.get('manager_note')?.invalid) {
      alert("Please provide additional information.");
      return;
    }
    const requestData = this.formData.get('manager_note')?.value; // Extract form values
  console.log(`Submitting manager note for ${action}:`, requestData); // Debugging

  this.managerService.process_manager_request(this.requestId, action, requestData).subscribe({
    next: (response) => {
      alert(`Request ${action}d successfully!`);
      this.router.navigate(['/manager/home']);  // Redirect to home page
    },
    error: (error) => {
      console.error(`Error submitting ${action} request:`, error);
      alert('Failed to submit request.');
    }
  });
}
logout() {
  this.authService.logout();
  this.router.navigate(['']);
}
}
