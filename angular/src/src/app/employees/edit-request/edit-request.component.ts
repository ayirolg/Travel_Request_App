import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html',
  styleUrl: './edit-request.component.css'
})
export class EditRequestComponent implements OnInit{
   requestId!: number;
   request_data: any = {};
   managerName= '';
   constructor(private employeeService: EmployeeService,private router: Router, private route: ActivatedRoute, private authService: AuthService ) {}
  

   EditFormData = new FormGroup({
    from_location: new FormControl(''),
    to_location: new FormControl(''),
    travel_from: new FormControl(''),
    travel_to: new FormControl(''),
    purpose_of_travel: new FormControl(''),
    lodging_required: new FormControl('No'), 
    lodging_location: new FormControl(''),
    additional_request: new FormControl(''),
    preferred_mode_of_travel:new FormControl()
  });
  fetchRequestData() {
    this.employeeService.getRequestData(this.requestId).subscribe({
      next: (data) => {
        console.log('Fetched Request:', data);
        this.request_data = data;
        if (data.manager) {
          this.managerName = `${data.manager.first_name} ${data.manager.last_name}`;
        }
        this.EditFormData.patchValue(this.request_data);
      },
      error: (error) => console.error('Error fetching request:', error)
    });
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('request_id'); 
      if (!id) {
        console.error('No Request Id Found! Redirecting');
        this.router.navigate(['/employees/home']); 
        return;
      }
      this.requestId = Number(id); 
      console.log("Fetched Request ID:", this.requestId);

      this.fetchRequestData();
    });
  }

  onSubmitEdit() {
    if (this.EditFormData.valid) {
      this.employeeService.edit_request(this.requestId, this.EditFormData.value).subscribe({
        next: (response) => {
          console.log('Request updated:', response);
          this.router.navigate(['/employees/home']); 
        },
        error: (error) => console.error('Error updating request:', error)
      });
    } else {
      console.error('Form is invalid');
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
