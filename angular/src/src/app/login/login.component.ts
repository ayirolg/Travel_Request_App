import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private authservice: AuthService,private router: Router){}
  userType="";

  loginform = new FormGroup({
    username: new FormControl('',Validators.required),
    password: new FormControl('',Validators.required),
  });

  setUserType(type:string){
    this.userType=type
  }

  signIn() {
    if (!this.userType) {
      alert("Please select a role before logging in!");
      return;
    }
  
    const data = {
      username: this.loginform.value.username,
      password: this.loginform.value.password,
      role: this.userType
    };
  
    this.authservice.login(data).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        if (this.userType === 'employee') {
          this.router.navigate(['employees/home']);
        } else if (this.userType === 'manager') {
          this.router.navigate(['manager/home']);
        } else if (this.userType==='admin'){
          this.router.navigate(['admin/home']);
        }
        console.log("Logged in Successfully");
      },
      error: (err) => {
        console.error("Login Failed:", err);
        alert("Invalid credentials or role selection error.");
      }
    });
  }
  
}
