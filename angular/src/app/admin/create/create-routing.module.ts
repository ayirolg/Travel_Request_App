import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeComponent } from './employee/employee.component';
import { DepartmentComponent } from './department/department.component';
import { ManagerComponent } from './manager/manager.component';
import { CreatePageComponent } from './create-page/create-page.component';

const routes: Routes = [
  { path: '', component: CreatePageComponent },
  { path: 'department', component: DepartmentComponent},
  { path: 'employee', component: EmployeeComponent},
  { path: 'manager', component: ManagerComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRoutingModule { }
