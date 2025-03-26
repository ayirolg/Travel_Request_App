import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './employees.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { NewRequestComponent } from './new-request/new-request.component';
import { EditRequestComponent } from './edit-request/edit-request.component';

const routes: Routes = [
  { path: '', component: EmployeesComponent },
  { path: 'home', component: EmployeeHomeComponent},
  { path: 'new_request', component:NewRequestComponent},
  { path: 'edit_request/:request_id', component: EditRequestComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
