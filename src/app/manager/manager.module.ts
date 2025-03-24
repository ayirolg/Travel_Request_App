import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { HomeComponent } from './home/home.component';
import { RequestDetailsComponent } from './request-details/request-details.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ManagerComponent,
    HomeComponent,
    RequestDetailsComponent
  ],
  imports: [
    CommonModule,
    ManagerRoutingModule,
    ReactiveFormsModule
  ]
})
export class ManagerModule { }
