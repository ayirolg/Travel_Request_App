import { Component } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';



@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrl: './new-request.component.css'
})
export class NewRequestComponent {
  formData!: FormGroup
  managerName: string = '';


    constructor(private employeeService: EmployeeService,private router: Router, private authService: AuthService) {
      }

      ngOnInit() {
        this.formData = new FormGroup({
          from_location: new FormControl('',Validators.required),
          to_location: new FormControl('',Validators.required),
          travel_from: new FormControl('',Validators.required),
          travel_to: new FormControl('',Validators.required),
          purpose_of_travel: new FormControl('',Validators.required),
          lodging_required: new FormControl('false'),  // Default: 'No'
          lodging_location: new FormControl(''),
          additional_request: new FormControl(''),
          modeOfTravel:new FormControl('Flight',Validators.required)
        });
        this.employeeService.getData().subscribe({
          next: (data) => {
            // console.log('API Response:', data);
            if (Array.isArray(data) && data.length > 0 && data[0].manager) {
              this.managerName = `${data[0].manager.first_name} ${data[0].manager.last_name}`;
            }
            else {
              console.warn('No manager data found in API response.');
            }
          },
          error: (error) => {
            console.error('Error fetching data:', error);
          },
          complete: () => {
            console.log('Data fetch completed.');
          }
        });
        
      }
      onsubmitForm() {
        const requestData = this.formData.value;  //Extract form values

        this.employeeService.createTravelRequest(requestData).subscribe({
          next: (response) => {
            alert('Request submitted successfully!');
            this.router.navigate(['/employees/home']);  // Redirect to home page
          },
          error: (error) => {
            console.error('Error submitting request:', error);
            alert('Failed to submit request.');
          }
        });
      }
      logout() {
        this.authService.logout();
        this.router.navigate(['']);
      }

}
