import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthenticationRoutes } from './authentication.routing';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterModule.forChild(AuthenticationRoutes)]
})
export class AuthenticationModule {
  constructor() {
  }
}
