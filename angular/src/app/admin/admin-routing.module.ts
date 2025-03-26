import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { RequestListComponent } from './request-list/request-list.component';
import { UserListComponent } from './userlist/userlist.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'home', component: AdminHomeComponent},
  { path: 'request-list',component: RequestListComponent },
  { path: 'create', loadChildren: () => import('./create/create.module').then(m => m.CreateModule) },
  { path: 'user-list', component: UserListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
