import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './manager.component';
import { HomeComponent } from './home/home.component';
import { RequestDetailsComponent } from './request-details/request-details.component';

const routes: Routes = [
  { path: '', component: ManagerComponent },
  { path: 'home', component: HomeComponent },
  { path: 'request_details/:id', component: RequestDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
