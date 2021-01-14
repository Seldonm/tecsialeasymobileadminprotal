import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { GenericCallService } from "../services/generic-call/generic-call.service";
import {MatDialog} from '@angular/material';
import { CreateUserComponent } from '../create-user/create-user.component';
import { MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  users: any = [];
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  datasource: any = null;

  displayedColumns: string[] = ['username', 'given_name', 'name', 'code'];

  constructor(private genericCall: GenericCallService, public dialog: MatDialog, private changeDetectorRefs: ChangeDetectorRef) { 
    this.readUsers();
  }

  ngOnInit() {
  }

  createUser() {


      const dialogRef = this.dialog.open(CreateUserComponent, {
        panelClass: 'create-user-container' ,
        width: '400px',
        data: {}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');

        this.readUsers();
        
      });
    
  
    
  }



  readUsers() {
    this.datasource = null;

    this.users = [];

    let params = {};

    this.genericCall
    .doCall("USERS", undefined, params, undefined)

    .subscribe(
    response => {
      //this.users = response;
      for (var i = 0; i < response.length; i++) {

        var curUser = {};
        curUser["username"] = response[i].username;
        curUser["userCreateDate"] = response[i].userCreateDate;
        curUser["userLastModifiedDate"] = response[i].userLastModifiedDate;
        curUser["enabled"] = response[i].enabled;
        curUser["userStatus"] = response[i].userStatus;
        for (var k = 0; k < response[i].attributes.length; k++) {
          curUser[response[i].attributes[k]["name"]] = response[i].attributes[k]["value"];
        }

        curUser["code"] = curUser["custom:userId"];
        this.users.push(curUser);

      }
      this.datasource = new MatTableDataSource(this.users);
      setTimeout(() => {
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;});
      this.changeDetectorRefs.detectChanges();
    },
    err => {
      

    })
    .add(() => this.genericCall.hideSpinner());
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
