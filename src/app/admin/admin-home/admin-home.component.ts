import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit{
  count:any=[]
  selectedType: string = '';
  constructor(private authService: AuthService, private router: Router, private adminService: AdminService){}

  ngOnInit(){
    this.adminService.getCount().subscribe({
      next: (data) => {
        this.count = data;
        console.log(this.count);
      },
      error: (error) => console.error('Error fetching data', error)
    });
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

}
