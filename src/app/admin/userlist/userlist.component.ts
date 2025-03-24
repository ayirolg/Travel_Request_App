import { Component, Input, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserListComponent {
  entityType: string = '';
  userList: any[] = [];
  @Input() type!: string;

  constructor(private adminService: AdminService, private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.entityType = params['type'] || 'managers'; // Default to managers
      this.fetchUsers();
    });
  }

  fetchUsers() {
    this.adminService.getEntityList(this.entityType).subscribe({
      next: (data) => {
        this.userList = data;
        console.log(this.userList)
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
