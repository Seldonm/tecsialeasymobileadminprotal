import { Component, OnInit } from '@angular/core';
import { GenericCallService } from "../services/generic-call/generic-call.service";
import { getMatTooltipInvalidPositionError } from '@angular/material';
import { ViewChild } from '@angular/core';
declare const google: any;

@Component({
  selector: 'app-usermapviewer',
  templateUrl: './usermapviewer.component.html',
  styleUrls: ['./usermapviewer.component.css']
})
export class UsermapviewerComponent implements OnInit {

  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;


  locations: any = null;
  operations: any = null;
  finalLocations: any = null;
  users: any = [];
  userSelected: any = null;
  accuratezza: any = '30';
  accuratezzaUltimaRicerca: any = '30';
  dataInizio: any = new Date();
  dataFine: any = new Date();
  oraInizio =   "00:00";
  oraFine = "23:59";
  selectedIndex = null;
  activityTypeToShow = [];
  accuratezzaList = [];

  timestampInizioUltimaRicerca = null;
  timestampFineUltimaRicerca = null;

  constructor(public genericCall: GenericCallService) { 
    this.readUsers();

    

    for (var i = 5; i <= 100; i = i + 5) {
      this.accuratezzaList.push({'value': i+""});
    }

    
  }

  resetMap() {

    var mapProp = {
      center: new google.maps.LatLng(41.2027767, 16.5987187),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

  }

  ngOnInit() {

    this.resetMap();
    
  }

  readGps() {

    this.selectedIndex = null;
    this.activityTypeToShow = [];

    this.resetMap();

    var inizio = this.oraInizio.split(":");
    var fine = this.oraFine.split(":");
    
    this.dataInizio.setHours(inizio[0],inizio[1],0,0);
    this.dataFine.setHours(fine[0],fine[1],59,999);
  

    let params = 
    {"end": this.dataFine.getTime(),
    "start": this.dataInizio.getTime(),
    "accurancy": this.accuratezza,
    "userId": this.userSelected};

    this.timestampFineUltimaRicerca = this.dataFine.getTime();
    this.timestampInizioUltimaRicerca = this.dataInizio.getTime();
    this.accuratezzaUltimaRicerca = this.accuratezza;

    this.locations = null;
    this.operations = null;
    this.finalLocations = [];

    this.genericCall
    .doCall("READGPS", undefined, params, undefined)

    .subscribe(
    response => {

      if (response[0] == null) {
        response = [];
      }

      this.locations = response;
      
      for (var k = 0; k < this.locations.length; k++) {
        this.activityTypeToShow[k] = this.getActivityType(this.locations[k]);
      }
      
      
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());

    var parameters = {"%userId%": this.userSelected, "%start%": this.dataInizio.getTime(), "%end%": this.dataFine.getTime()};


    this.genericCall
    .doCall("INTERVAL_OPERATIONS", undefined, undefined, parameters)

    .subscribe(
    response => {


      this.operations = response;
    
      
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());



  }



  getActivityType(locations) {

    //"activity_type":"in_vehicle","activity_type_confidence":100

    //Creo una mappa di tipi attività
    var activityType = {};
    for (var i = 0; i < locations.length; i++) {
      
    

      //Verifico se la locations ha il tipo attività impostato, altrimenti consider che sia in_vehicle al 100%
      if (locations[i]["activity_type"]) {

        //Verifico se esiste già la chiave da memorizzare, altrimenti inizializzo a 0
        if (!activityType[locations[i]["activity_type"]]) {
          activityType[locations[i]["activity_type"]] = 0;
        }

        activityType[locations[i]["activity_type"]] = activityType[locations[i]["activity_type"]] + locations[i]["activity_type_confidence"] / 100;
      
      } else {

        if (!activityType["in_vehicle"]) {
          activityType["in_vehicle"] = 0;
        }

        activityType["in_vehicle"] = activityType["in_vehicle"] + 1;

      }

    }

    var defActivityType = null;
    var defActivityPerc = null;
    for (var key in activityType) {

      if (activityType.hasOwnProperty(key)) {
        if (activityType[key] > defActivityPerc) {
          defActivityType = key;
          defActivityPerc = activityType[key];
        }
    }

    }

    return defActivityType;

  }

  getRoutePath(index) {
    this.selectedIndex = index;
    var locationsPath = this.locations[index];
    this.normalizeGoogleData(locationsPath);
  }



  getLabel(i) {
    return "P"+i;
  }

  getSnapToRoadPoint(locationsPath, callsDone, callsToDo, maxPoints) {

    var from = callsDone * maxPoints;
    var to = from + maxPoints;
    if (to > locationsPath.length) {
      to = locationsPath.length;
    }

    var path = null;

    for (var i = from; i < to; i++) {
      var position = locationsPath[i]['latitude']+","+locationsPath[i]['longitude'];
      if (!path) {
        path = position;
      } else {
        path = path+"|"+position;
      }

    }

      let params = {"path": path, "interpolate": true, key: 'AIzaSyAVXDXdoMiWbWoem94_N_dIyD0RzHgTqGQ'};
      this.genericCall.doCall("SNAPPEDPOINTS", undefined, params, undefined)
      .subscribe(
        response => {
            if ('snappedPoints' in response) {
              this.finalLocations = this.finalLocations.concat(response['snappedPoints']);
           }

        callsDone++;

        if (callsDone == callsToDo) {
          this.changeMap(locationsPath);
          this.genericCall.hideSpinner();
        } else {
          this.getSnapToRoadPoint(locationsPath,callsDone, callsToDo, maxPoints);
          this.genericCall.decrementActiveCalls();
        }
    });

  
}

  normalizeGoogleData(locationsPath) {

    const maxPoints = 100;
    var totalCallToDo = Math.ceil(locationsPath.length/maxPoints);
    var totalCallDone = 0;
    this.finalLocations = [];
    this.getSnapToRoadPoint(locationsPath, totalCallDone, totalCallToDo, maxPoints)
    

  }

  changeMap(locationsPath) {

    var userCoords = [];
    for (var i = 0; i < this.finalLocations.length; i++) {
      var loc = {"lng": this.finalLocations[i].location.longitude, "lat": this.finalLocations[i].location.latitude};
      userCoords.push(loc);
    }

    this.map = new google.maps.Map(this.gmapElement.nativeElement, {
      zoom: 13,
      center: {lat: userCoords[0].lat, lng: userCoords[0].lng},
      mapTypeId: 'roadmap'
    });

    /*var lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };*/

    
    var lineSymbol = null;
    var color = null;
    if (this.activityTypeToShow[this.selectedIndex] == "in_vehicle") {
      color = '#0000ff';
       lineSymbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        //strokeOpacity: 1,
        scale: 2,
        strokeWeight: 2,
        strokeColor: color
      };
    } else {
      color = '#FF0000';
       lineSymbol = {
        path: google.maps.SymbolPath.CIRCLE,
        //strokeOpacity: 1,
        scale: 2,
        strokeColor: color
      };

    }

    var icons = [];
    //Ogni 20 punti una icona
    const iconNumber = Math.ceil(userCoords.length / 20);
    var actualPercentage = 0;
    for (i = 0; i < iconNumber; i++) {
      actualPercentage = 100/iconNumber + actualPercentage;
      var icon = {
        icon: lineSymbol,
        offset: actualPercentage+'%'
      };
      icons.push(icon);

    }

    
    

    if (this.activityTypeToShow[this.selectedIndex] == "in_vehicle") {
    var userPath = new google.maps.Polyline({
      path: userCoords,
      icons: icons,
      //strokeOpacity: 0,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2
    }); } else {
      var userPath = new google.maps.Polyline({
        path: userCoords,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 1,
        icons: icons
      }); 

    }

    userPath.setMap(this.map);

    var latLongPartenza = {lat: userCoords[0].lat, lng: userCoords[0].lng};
    var partenza = new google.maps.Marker({
      position: latLongPartenza,
      map: this.map,
      title: 'Partenza Ore ' +  this.genericCall.getOraMinuti(locationsPath[0].timestamp),
      label: 'P'
    });

    var latLongArrivo = {lat: userCoords[userCoords.length-1].lat, lng: userCoords[userCoords.length-1].lng};
    var arrivo = new google.maps.Marker({
      position: latLongArrivo,
      map: this.map,
      title: 'Arrivo Ore ' +  this.genericCall.getOraMinuti(locationsPath[locationsPath.length-1].timestamp),
      label: "A"
    });
  
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
              this.readGps();
            }
          }
          
        }
        this.users.push(curUser);

      }
    },
    err => {
      

    }).add(() => this.genericCall.hideSpinner());
  }

  parseFloat(n) {
    return parseFloat(n);
  }

}
