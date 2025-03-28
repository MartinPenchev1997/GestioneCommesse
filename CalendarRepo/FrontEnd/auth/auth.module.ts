import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthenticationRoutes } from './authentication.routing';
import { SigninComponent } from './signin/signin.component.';

@NgModule({
  declarations: [LoginComponent,SigninComponent],
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterModule.forChild(AuthenticationRoutes)]
})
export class AuthenticationModule {
  constructor() {
  }
}
