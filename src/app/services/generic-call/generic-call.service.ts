import { Injectable } from "@angular/core";
import { JsonReaderService } from "../json-reader/json-reader.service";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/of";
import "rxjs/add/observable/empty";
import "rxjs/add/operator/retry";
// Import RxJs required methods
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { BehaviorSubject } from "rxjs";
import { MatSpinner } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { GenericDialogComponent } from "src/app/generic-dialog/generic-dialog.component";
@Injectable({
  providedIn: 'root'
})
export class GenericCallService {

  activeCalls: number = 0;
  timeout: number = 30000;
  token: any;
  loading: any;
  username: string;
  password: string;
  storage = localStorage;
  private spinnerRef: OverlayRef = this.cdkSpinnerCreate();

  public isConnected: boolean = true;
  public initFinished = new BehaviorSubject(null);

  // Resolve HTTP using the constructor
  constructor(    
    private httpClient: HttpClient,
    private overlay: Overlay,
    private jsonReader: JsonReaderService, 
    public dialog: MatDialog
    //private storage: Storage,    
  ) {
    this.init();
  }

  afterLogin(token, username, password) {
    
    this.token = token;
    this.username = username;
    this.password = password; 
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.TOKEN"), JSON.stringify(token));  
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.USERNAME"), username);
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.PASSWORD"), password);
   
  }

  getPaginationLength() {
    return this.jsonReader.getGlobal("PAGINATION_LENGTH");
  }  



  afterLogout() {
    this.token = null;
    this.username = null;
    this.password = null;
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.TOKEN"), null);    
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.USERNAME"), null);
    this.storage.setItem(this.jsonReader.getGlobal("STORAGE.PASSWORD"), null);
    
  }

  failureCallback(error) {
    console.log("Errore durante l'accesso al keychain: " + error);
  }

  successCallback(success) {
    console.log("Successo nell'inserimento nel keychain: " + success);
  }

  init() {
    //Impostiamo le chiamate attive a 0
    this.activeCalls = 0;
    this.token  = JSON.parse(this.storage.getItem(this.jsonReader.getGlobal("STORAGE.TOKEN")));
    this.password = this.storage.getItem(this.jsonReader.getGlobal("STORAGE.PASSWORD"));
    this.username = this.storage.getItem(this.jsonReader.getGlobal("STORAGE.USERNAME"));
    //TODO da rimuovere
    this.initFinished.next(true);

  }

  getFullPath(serviceName) {
    let serviceObject = this.jsonReader.getService(serviceName);
    return this.jsonReader.getGlobal("API_ENDPOINT") + serviceObject["PATH"];
  }

  /**
   * Metodo per effettuare chiamate HTTP
   * @param serviceName Nome del servizio da richiamare
   * @param params Parametri da agganciare al servizio da richiamare
   * @returns {Observable<any>} Risposta della chiamata (sia di successo che di errore)
   */
  doCall(serviceName: string, fullEndpoint?: string, params?, pathParams?, forceHttpOptions?): Observable<any> {
    
    let fullPath: string;
    let serviceObject: JSON;

    if (params === undefined) {
      params = new HttpParams();
    }

    //Creazione del servizio da richiamare
    serviceObject = this.jsonReader.getService(serviceName);
    if (fullEndpoint) {
      fullPath = fullEndpoint;
    } else if (!serviceObject['FULLPATH']) {
      fullPath = this.getFullPath(serviceName); //this.jsonReader.getGlobal("API_ENDPOINT") + serviceObject["PATH"];
    } else {
      fullPath = serviceObject['PATH'];
    }
    if (pathParams) {

      for (var key in pathParams) {
        if (pathParams.hasOwnProperty(key)) {
          fullPath = fullPath.replace(key, pathParams[key]);
        }
      }
    }

    return this.doCallObservable(serviceName, serviceObject, fullPath, params, forceHttpOptions);
  }

  public doCallObservable(
    serviceName: string,
    serviceObject: JSON,
    fullPath: string,
    params,
    forceHttpOptions
  ) {
    let returnedObservable: Observable<any>;

      if (this.activeCalls == 0) {
        this.showSpinner();
      }

      this.activeCalls++;
      console.log("Chiamate attive dopo incremento "+serviceName+" : "+this.activeCalls);

      
      if (forceHttpOptions) {
        httpOptions = forceHttpOptions;
      } else {
      var httpOptions = {};
      //Creazione header autorizzativo


      if (serviceObject["METHOD"] == "GET") {
        httpOptions["params"] = params;
      }
    }

      console.log(
        "CHIAMATA CON METODO " +
          serviceObject["METHOD"] +
          " al servizio " +
          fullPath +
          " con i seguenti parametri " +
          JSON.stringify(params)
      );

      //In base al metodo effettuiamo la giusta chiamata
      //TODO: aggiungere gli altri metodi
      switch (serviceObject["METHOD"]) {
        case "GET": {
          //const options = { params: new HttpParams(params), headers: headers };
          returnedObservable = this.httpClient
            .get(fullPath, httpOptions)
            .map(res => this.extractData(res, serviceObject))
            .catch(error => this.handleError(error));

          break;
        }
        case "POST": {
          returnedObservable = this.httpClient
            .post(fullPath, params, httpOptions)            
            .map(res => this.extractData(res, serviceObject))
            .catch(error => this.handleError(error));
            
          break;
        }

        case "PUT": {
          returnedObservable = this.httpClient
            .put(fullPath, params, httpOptions)
            .map(res => this.extractData(res, serviceObject))
            .catch(error => this.handleError(error));

          break;
        }

        case "DELETE": {
          returnedObservable = this.httpClient
            .delete(fullPath, httpOptions)
            .map(res => this.extractData(res, serviceObject))
            .catch(error => this.handleError(error));

          break;
        }
        default: {
          //statements;
          break;
        }
      }
    

    return returnedObservable;
  }

  /*decrementCalls() {
    this.activeCalls--;
    if (this.activeCalls == 0) {
      this.stopSpinner();
    }
  }*/

  /*showSpinner() {
    this.activeCalls++;

  }

  hideSpinner() {
    this.activeCalls--;

  }*/

  /**
   * Metodo per l'elaborazione della risposta prima che venga restituita al chiamante
   * @param res Risposta da elaborare
   * @returns {any} Riposta post elaborazione
   */
  private extractData(res, serviceObject) {

    //Se siamo in fullpath o non abbiamo
    //Il server ha risposto correttamente ma c'è un errore nella risposta. Lo vedo solo se non devo restituire tutto a prescindere
    //RETURNALL = true
    if (!serviceObject['RETURNALL'] && res["code"] != 0) {
      console.log("Estrazione dati dopo chiamata REST andata in errore");
      throw new Error(res["message"]);
    }

    console.log("Estrazione dati dopo chiamata REST OK" + JSON.stringify(res));

    

    //Inserire qui eventuali elaborazioni della risposta prima di restituirla
    if (!serviceObject['RETURNALL']) {
    return res["output"];
  } else {
    return res;
  }
  }

  /**
   * Metodo per la gestione degli errori. Qui si intercettano anche errori HTTP
   * @param error Errore da gestire
   * @returns {any} Errore restituito a valle dell'elaborazione
   */
  private handleError(error) {

    //this.decrementCalls();
   /* console.log("Errore di chiamata REST:" + JSON.stringify(error));
  

    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof HttpErrorResponse) {

      errMsg = error.status + " " + error.statusText;
      switch (error.status) {
        case 0: {
          errMsg = "Errore generico";
          //statements;
          break;
        }
      }
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    
    
    this.openDialog('Errore', errMsg);
    
    return Observable.throw(errMsg);*/


    console.log("Errore di chiamata REST:" + JSON.stringify(error));
  

    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof HttpErrorResponse) {
      /*const body = error.json() || '';
                 const err = body.error || JSON.stringify(body);
                 errMsg = `${error.status} - ${error.statusText || ''} ${err}`;*/
      errMsg = error.status + " " + error.statusText;
      switch (error.status) {
        case 0: {
          errMsg = "Errore generico";
          //statements;
          break;
        }

        case 401: {
          errMsg = "Sessione scaduta o non valida";
          //statements;
          break;
        }

      }
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    this.openDialog('Errore', errMsg);

    return Observable.throw(errMsg);




    //this.loader.dismiss();
  }

  private cdkSpinnerCreate() {

    return this.overlay.create({
 
           hasBackdrop: true,
 
           backdropClass: 'dark-backdrop',
 
           positionStrategy: this.overlay.position()
 
            .global()
 
            .centerHorizontally()
 
            .centerVertically()
 
           })
 
 }
 
 showSpinner() {
 
    this.spinnerRef.attach(new ComponentPortal(MatSpinner))
 
 }

 decrementActiveCalls() {
   this.activeCalls--;
   console.log("Chiamate attive dopo decremento: "+this.activeCalls);
   if (this.activeCalls < 0) {
     this.activeCalls = 0;
   }
 }
 
 hideSpinner() {
   this.decrementActiveCalls();
   if (this.activeCalls == 0)
    this.spinnerRef.detach();
 
 }

delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}


 openDialog(title, message): void {
  const dialogRef = this.dialog.open(GenericDialogComponent, {
    width: '400px',
    data: {title: title, message: message}
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed');
    //this.animal = result;
  });
}




getOraMinuti(unix_timestamp) {
  var date = new Date(unix_timestamp);
// Hours part from the timestamp
var hours = "0" + date.getHours();
// Minutes part from the timestamp
var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2);// + ':' + seconds.substr(-2);
return formattedTime;
}

getDataFormat(timestamp) {
  var date = new Date(timestamp);
  var mese = date.getMonth()+1;
  return date.getDate() + "/" + mese + "/" + date.getFullYear()
}




}
