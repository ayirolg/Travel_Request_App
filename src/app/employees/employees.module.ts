import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { NewRequestComponent } from './new-request/new-request.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EditRequestComponent } from './edit-request/edit-request.component';


@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeeHomeComponent,
    NewRequestComponent,
    EditRequestComponent
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    ReactiveFormsModule
  ]
})
export class EmployeesModule { }
