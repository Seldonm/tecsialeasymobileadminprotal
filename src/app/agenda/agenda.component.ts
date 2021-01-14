import { Component, OnInit , ViewChild, ChangeDetectorRef} from '@angular/core';
import { GenericCallService } from "../services/generic-call/generic-call.service";
import { MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {

  eventi: any = [];
  clienti: any = [];
  users: any = [];
  userSelected: any = null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  datasource = new MatTableDataSource();
  displayedColumns: string[] = [
    
    "description",
    "cliente",
    "giornaliero",
    "data",
    "ora_inizio",
    "ora_fine"
    
  ];

  constructor(public genericCall: GenericCallService,  private changeDetectorRefs: ChangeDetectorRef) { 
    this.getCustomers();
  }

  ngOnInit() {
  }

  readUsers() {

    let params = {};

    this.genericCall
    .doCall("USERS", undefined, params, undefined)

    .subscribe(
    response => {
      //this.users = response;
      for (var i = 0; i < response.length; i++) {

        
        var curUser = {};
        curUser["name"] = response[i].username;
        for (var k = 0; k < response[i].attributes.length; k++) {

          

          if (response[i].attributes[k]["name"] == "custom:userId") {
            curUser["id"] = response[i].attributes[k]["value"];
            if (i == 0) {
              this.userSelected = curUser["id"];
              this.readEventi();
            }
          }
          
        }
        this.users.push(curUser);

      }
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());
  }


  readCustomers(pageNumber) {

    var params = { "%numPage%": pageNumber, "%pagination%": true };

    this.genericCall
      .doCall("CUSTOMER", undefined, undefined, params)
      .subscribe(
        response => {
          
          if (!response || response.length == 0) {
            this.readUsers();
          } else {
            this.clienti = this.clienti.concat(response);
            if (response.length == this.genericCall.getPaginationLength()) {
              this.readCustomers(pageNumber+1);
            } else {
              this.readUsers();
            }
            
          }

        },
        err => { this.genericCall.hideSpinner(); }
      ).add(() => this.genericCall.decrementActiveCalls());

  }

  getCustomers() {

    this.readCustomers(0);

  }

  findCustomer(customer) {
    var clienteRET = null;
    var idCustomer = null;
    if ('idCustomer' in customer) {
      idCustomer = customer['idCustomer'];
    }
    if (idCustomer) {

      for (var i = 0; i < this.clienti.length; i++) {
        if (this.clienti[i]["id"] == idCustomer) {
          clienteRET = this.clienti[i];
          break;
        }
      }

  }

  if (clienteRET) {
    return clienteRET.descCustomer;
  } else {
    return "";
  }
    
  }


  readEventi() {

    this.datasource = null;
    var parameters = {"%userId%": this.userSelected};


    this.genericCall
    .doCall("AGENDA", undefined, undefined, parameters)

    .subscribe(
    response => {


      this.eventi = response;

      this.datasource = new MatTableDataSource(response);
      setTimeout(() => {
          this.datasource.paginator = this.paginator;
          this.datasource.sortingDataAccessor = (item, property) => {
            switch(property) {
              case 'cliente': return this.findCustomer(item);
              case 'giornaliero': return item["allDay"] ? "Si" : "No";
              case 'data': return item["date"];
              case 'ora_inizio': return item["start"];
              case 'ora_fine': return item["end"];
              default: return item[property];
            }
          };
          this.datasource.sort = this.sort;
        });
          this.changeDetectorRefs.detectChanges();
    
      
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());

  }






}
