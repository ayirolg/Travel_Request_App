import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { RequestListComponent } from './request-list/request-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserListComponent } from './userlist/userlist.component';


@NgModule({
  declarations: [
    AdminComponent,
    AdminHomeComponent,
    RequestListComponent,
    UserListComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
