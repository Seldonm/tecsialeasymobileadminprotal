import { Injectable } from '@angular/core';
import {
    HttpClient, HttpBackend
  } from "@angular/common/http";

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/catch";
import 'rxjs/add/observable/throw';

@Injectable({
  providedIn: 'root'
})
export class JsonReaderService {

  private _services: Object;
    private _global: Object;
    private _chcp: Object;

    private httpClient: HttpClient;

    constructor(handler: HttpBackend) {
        this.httpClient = new HttpClient(handler);
    }

    public load() {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./assets/config/services.json')            
            //.map((res: Response) => res.json())
            .catch((error: any): any => {
                console.log('Configuration file "services.json" could not be read');
                resolve(true);
                return Observable.throw(error || 'Server error');
            }).subscribe((servicesResponse) => {

                this._services = servicesResponse;

                this.httpClient.get('./assets/config/global.json')
                    //.map((res: Response) => res.json())
                    .catch((error: any) => {
                        console.log('Configuration file "global.json" could not be read');
                        resolve(error);
                        return Observable.throw(error || 'Server error');
                    })
                    .subscribe((globalData) => {
                        this._global = globalData;
                        resolve(true);


                    });

            });

        });
    }

    getService(key: any) {
        return this._services[key];
    }

    getChcp(key: any) {
        return this._chcp[key];
    }

    getGlobal(key: any) {

        //Otteniamo tutte le chiavi da leggere
        let splittedKeys = key.split('.');
        let keyValue: any;

        //La prima chiave serve per recuperare l'oggetto di primo livello
        keyValue = this._global[splittedKeys[0]];
        for (var _i = 1; _i < splittedKeys.length; _i++) {
            keyValue = keyValue[splittedKeys[_i]];
        }

        return keyValue;
    }

}
