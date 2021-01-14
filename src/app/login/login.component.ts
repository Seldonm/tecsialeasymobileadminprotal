import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {Router} from "@angular/router";
import { GenericCallService } from "../services/generic-call/generic-call.service";
import { Validators } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  constructor(private router: Router, private fb: FormBuilder, public genericCall: GenericCallService)  { 
    
  }
  ngOnInit() {
    this.genericCall.afterLogout();
    
  }

  login() {

    

 
    this.genericCall
      .doCall("LOGIN", undefined, { username: this.loginForm.get('username').value, password: this.loginForm.get('password').value }, undefined)
      
      .subscribe(
      response => {

        this.router.navigate(['/main/usermapviewer']);
        this.genericCall.afterLogin(response, this.loginForm.get('username').value, this.loginForm.get('password').value);
        //this.readGps();
        
      },
      err => {
        

      })
      .add(() => this.genericCall.hideSpinner());

    
  }

}
