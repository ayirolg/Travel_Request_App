import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';
import { ManagerComponent } from './manager/manager.component';
import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CreateComponent,
    ManagerComponent,
    EmployeeComponent,
    DepartmentComponent,
    CreatePageComponent
  ],
  imports: [
    CommonModule,
    CreateRoutingModule,
    ReactiveFormsModule
  ]
})
export class CreateModule { }
