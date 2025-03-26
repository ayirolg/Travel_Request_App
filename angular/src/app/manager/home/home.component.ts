import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  request_data: any=[];
  selectedRequest:number | null =null   ;
  formData!: FormGroup
  filterForm: FormGroup;
  
  constructor(private managerService: ManagerService,private router: Router, private authService: AuthService, private route: ActivatedRoute ){
    this.filterForm = new FormGroup({
      status: new FormControl(''),
      from_date: new FormControl(''),
      to_date: new FormControl(''),
      search:new FormControl(''),
      sort_by:new FormControl('')
    });

  }
  ngOnInit() {
    this.fetchRequests();
  }
  
  getRequestId(request_id: number) {
    this.selectedRequest = request_id;
    this.managerService.setRequestId(request_id);
    this.router.navigate([`/manager/request_details`, request_id]);
  }

  fetchRequests() {
    const filters = this.filterForm.value;
    this.managerService.getManagerRequestHistory(filters).subscribe({
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
    this.managerService.getManagerRequestHistory(filters).subscribe({
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
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
