import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent {
  departmentForm: FormGroup;

  constructor(private adminService: AdminService, private router: Router) {
    this.departmentForm = new FormGroup({
      name: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    if (this.departmentForm.valid) {
      const data = { type: 'department', ...this.departmentForm.value };
      this.adminService.createEntity(data).subscribe(
        (response) => {
          alert(response.message);
          this.router.navigate(['/admin/home']);
        },
        (error) => {
          console.error('Error:', error);
          alert('Failed to create department.');
        }
      );
    }
  }
}
