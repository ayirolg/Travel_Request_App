import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent implements OnInit {
  managerForm: FormGroup;
  departments: any=[];
  constructor(private adminService: AdminService, private router: Router, private authService : AuthService){
    this.managerForm = new FormGroup({
          username: new FormControl(''),
          email: new FormControl('', [Validators.required, Validators.email]),
          password: new FormControl('', Validators.required),
          first_name: new FormControl('', Validators.required),
          last_name: new FormControl('', Validators.required),
          department: new FormControl('', Validators.required)
        });
  }

  ngOnInit() {
    this.adminService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        console.log('Form Valid after managers load:', this.managerForm.valid);
      },
      error: (error) => console.error('Error fetching managers:', error)
    });
  }
  onSubmit() {
    if (this.managerForm.valid) {
      const managerData = {
        type: 'manager',  // Required for the API
        department: this.managerForm.value.department,
        username: this.managerForm.value.email.split('@')[0], 
        email: this.managerForm.value.email,
        password: this.managerForm.value.password,
        first_name: this.managerForm.value.first_name,
        last_name: this.managerForm.value.last_name
      };    
    this.adminService.createEntity(managerData).subscribe({
      next: (response) => {
        console.log('Form Valid:', this.managerForm.valid);
        console.log(this.managerForm.value);
        alert('Manager created successfully')
        console.log('Manager created successfully:', response);
        this.router.navigate(['/admin/home']);
      },
      error: (error) => {
        console.error('Error creating manager:', error);
      }
    });
  }
}
logout() {
  this.authService.logout();
  this.router.navigate(['']);
}

}
