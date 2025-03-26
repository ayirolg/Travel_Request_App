import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit{
  employeeForm: FormGroup;
  managers: any[] = [];

  constructor(private adminService: AdminService, private router: Router, private authService: AuthService) {
    this.employeeForm = new FormGroup({
      username: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      manager: new FormControl ('', Validators.required),
      first_name: new FormControl('', Validators.required),
      last_name: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.adminService.getManagers().subscribe({
      next: (data) => {
        this.managers = data;
        console.log(data)
        console.log('Form Valid after managers load:', this.employeeForm.valid);
      },
      error: (error) => console.error('Error fetching managers:', error)
    });
  }
  
  onSubmit() {
      if (this.employeeForm.valid) {
        const employeeData = {
          type: 'employee',  // Required for the API
          manager: this.employeeForm.value.manager,
          username: this.employeeForm.value.email.split('@')[0], // Example username
          email: this.employeeForm.value.email,
          password: this.employeeForm.value.password,
          first_name: this.employeeForm.value.first_name,
          last_name: this.employeeForm.value.last_name
        };      
      this.adminService.createEmployee(employeeData).subscribe({
        next: (response) => {
          console.log('Form Valid:', this.employeeForm.valid);
          console.log(this.employeeForm.value);
          console.log('Employee created successfully:', response);
          this.router.navigate(['/admin/home']);
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

}
