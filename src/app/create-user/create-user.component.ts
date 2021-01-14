import { Component, OnInit, Inject } from '@angular/core';
import { GenericCallService } from "../services/generic-call/generic-call.service";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

export interface DialogData {
  userId: string;
  username: string;
  lastName: string;
  firstName: string;
  temporaryPassword: string;
}


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  public userForm: FormGroup;

  //The string must contain at least 1 lowercase alphabetical character
  //The string must contain at least 1 uppercase alphabetical character
  //	The string must contain at least 1 numeric character
  //The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
  //The string must be eight characters or longer
   strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  


  constructor(public dialogRef: MatDialogRef<CreateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private genericCall: GenericCallService) {

      
     }

  ngOnInit() {

    this.userForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      userId: new FormControl('', [Validators.required, , Validators.maxLength(3), Validators.minLength(3)]),
      temporayPassword: new FormControl('', [Validators.required, Validators.pattern(this.strongRegex)]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required])});
  }

  getErrorMessage() {
    return "Valore non valido o obbligatorio";
  }

  getErrorMessagePassword() {
    return "La password non rispetta i criteri indicati";
  }


  close() {
    this.dialogRef.close();
  }

  public hasError = (controlName: string, errorName: string) =>{
    console.log(errorName);
    return this.userForm.controls[controlName].hasError(errorName);
  }

  register(userFormValue) {
   

    let params = {
      "username": userFormValue.username,
      "userId": userFormValue.userId,
      "temporayPassword": userFormValue.temporayPassword,
      "firstName": userFormValue.firstName,
      "lastName": userFormValue.lastName
    }


    this.genericCall
    .doCall("REGISTRATION", undefined, params, undefined)

    .subscribe(
    response => {

      
    this.genericCall
      .doCall("USERLOGIN", undefined, { username: userFormValue.username, password: userFormValue.temporayPassword, newPassword: userFormValue.temporayPassword }, undefined)

      .subscribe(
      response => {

        this.close();
        
      },
      err => {
        

      }).add(() => this.genericCall.hideSpinner());
      
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());
  }

}
