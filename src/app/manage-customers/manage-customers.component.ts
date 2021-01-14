import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { GenericCallService } from "../services/generic-call/generic-call.service";
import { MatPaginator, MatTableDataSource, MatSort } from "@angular/material";
import { RequestOptions } from "@angular/http";
import { HttpClient } from "@angular/common/http";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OperationsListComponent } from "../operations-list/operations-list.component";


@Component({
  selector: "app-manage-customers",
  templateUrl: "./manage-customers.component.html",
  styleUrls: ["./manage-customers.component.css"]
})



export class ManageCustomersComponent implements OnInit {
  @ViewChild("fileInput") fileInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  totalCustomers = [];
  datasource = new MatTableDataSource();
  displayedColumns: string[] = [
    "id",
    "descCustomer",
    "tipo",
    "cf",
    "citta",
    "indirizzo",
    "email",
    "telefono",
    "servizi"
  ];



  constructor(
    private genericCall: GenericCallService,
    private http: HttpClient,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef
  ) {

      this.readCustomers(0);

 
  }

  initTable() {
    this.datasource = new MatTableDataSource(this.totalCustomers);
            this.datasource.paginator = this.paginator;
            this.datasource.sort = this.sort;
            this.datasource.filterPredicate = (data, filter) => {
              const dataStr = data["id"] + data["descCustomer"] + this.getTipo(data["tipo"]) +
              data["cf"] + data["citta"] + "("+data["provincia"] + ")" + 
              data["indirizzo"] + data["email"] + data["telefono"] + this.getServizi(data["customerServices"]);
              return dataStr.toLowerCase().indexOf(filter) != -1; 
            }
  }


  readCustomers(pageNumber) {

    var params = { "%numPage%": pageNumber, "%pagination%": true };

    this.genericCall
      .doCall("CUSTOMER", undefined, undefined, params)
      .subscribe(
        response => {
          
          if (!response || response.length == 0) {
            this.initTable();
            this.genericCall.hideSpinner();
          } else {
            this.totalCustomers = this.totalCustomers.concat(response);
            console.log(this.genericCall.getPaginationLength());
            if (response.length == this.genericCall.getPaginationLength()) {
              this.readCustomers(pageNumber+1);
            } else {
              this.initTable();
              this.genericCall.hideSpinner();
            }
            
          }

        },
        err => { this.genericCall.hideSpinner(); }
      ).add(() => this.genericCall.decrementActiveCalls());

  }

  

 


  selectCliente(cliente) {
    console.log(cliente);

    //?idCustomer=$idCustomer$
    var params = { "%idCustomer%": cliente.id };

    this.genericCall
      .doCall("CUSTOMER_OPERATION", undefined, undefined, params)

      .subscribe(
        response => {

          const dialogRef = this.dialog.open(OperationsListComponent, {
            panelClass: 'create-user-container',
            width: '600px',
            data: { operations: response }
          });

          dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            //this.animal = result;
          });


        },
        err => { }
      )
      .add(() => this.genericCall.hideSpinner());


  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


  getServizi(serviziArray) {
    var servizi = "";

    for (var i = 0; i < serviziArray.length; i++) {
      if (servizi == "") {
        servizi = serviziArray[i].tipoServizio;
      } else {
        servizi += ", " + serviziArray[i].tipoServizio;
      }
    }

    return servizi;
  }

  getTipo(tipo) {
    if (tipo == "AZ") {
      return "Azienda";
    } else if (tipo == "CDL") {
      return "Consulente del Lavoro";
    } else {
      return "-";
    }
  }

  ngOnInit() {
    // this.datasource.paginator = this.paginator;
  }

  caricaFile(event) {


    const fileSelected: File = event.target.files[0];



    let params = {};

    this.genericCall
      .doCall("SENDFILEGETURL", undefined, params, undefined)

      .subscribe(
        response => {
          this.putFile(response, fileSelected, fileSelected.type);
        },
        err => { }
      )
      .add(() => this.genericCall.hideSpinner());

  }


  putFile(url, file, type) {
    let headers = new Headers();
    headers.append(
      "Content-Type",
      type
    );
    headers.append("Accept", "application/json");

    let httpOptions = {};
    httpOptions["headers"] = headers;
    httpOptions["reportProgress"] = true;

    this.genericCall
      .doCall("SENDFILEPUT", url, file, undefined, httpOptions)

      .subscribe(
        response => {
          this.genericCall.openDialog(
            "Esito Upload",
            "File caricato con successo. I clienti aggiornati saranno disponibili tra 5 minuti."
          );
        },
        err => {
          this.genericCall.openDialog("Esito Upload", err);
        }
      )
      .add(() => {
        this.genericCall.hideSpinner();
        this.fileInput.nativeElement.value = "";
      });
  }




}
