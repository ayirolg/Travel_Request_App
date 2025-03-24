import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrl: './create-page.component.css'
})
export class CreatePageComponent {
  constructor(private router: Router, private adminService: AdminService, private authService: AuthService) {}

  onTypeChange(event: Event) {
    const selectedType = (event.target as HTMLSelectElement).value; // ✅ Fixes the error
    this.adminService.setSelectedType(selectedType);
  
    if (selectedType === 'department') {
      this.router.navigate(['/admin/create/department']);
    } else if (selectedType === 'employee') {
      this.router.navigate(['/admin/create/employee']);
    } else if (selectedType === 'manager') {
      this.router.navigate(['/admin/create/manager']);
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

}
