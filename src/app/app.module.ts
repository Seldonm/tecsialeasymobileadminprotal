import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule, Routes } from "@angular/router";
import { CustomMaterialModule } from "./core/material.module";
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { HomeLayoutComponent } from './home-layout/home-layout.component';
import { LoginComponent } from './login/login.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { JsonReaderService } from "./services/json-reader/json-reader.service";
import { MatPaginatorIntlCro } from "./services/mat-table/MatPaginatorIntlCro";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
//import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsermapviewerComponent } from './usermapviewer/usermapviewer.component';
import { MatSpinner } from '@angular/material';
import {
  MAT_DATE_LOCALE
} from '@angular/material';
import { GenericDialogComponent } from './generic-dialog/generic-dialog.component';
import { Interceptor } from './services/interceptor/interceptor.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { ManageCustomersComponent } from './manage-customers/manage-customers.component';
import { OperationsListComponent } from './operations-list/operations-list.component';
import { AgendaComponent } from './agenda/agenda.component';
import { MatPaginatorIntl } from '@angular/material';
import { RequestCacheService } from "./services/request-cache/requestCache.service";

const appRoutes: Routes = [
  { path: '', redirectTo: 'login', data: { title: 'First Component' }, pathMatch: 'full' },

  {
    path: 'login', component: LoginLayoutComponent, data: { title: 'First Component' },
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: 'main', component: HomeLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'usermapviewer'
      },
      { path: 'usermapviewer', component: UsermapviewerComponent },
      { path: 'adminusers', component: AdminUsersComponent },
      { path: 'managecustomers', component: ManageCustomersComponent },
      { path: 'agenda', component: AgendaComponent }



    ]
  }
];
@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LoginLayoutComponent,
    HomeLayoutComponent,
    LoginComponent,
    ToolbarComponent,
    UsermapviewerComponent,
    GenericDialogComponent,
    AdminUsersComponent,
    CreateUserComponent,
    ManageCustomersComponent,
    OperationsListComponent,
    AgendaComponent
  ],
  imports: [
    CommonModule,
    NgtUniversalModule,
    NgxMaterialTimepickerModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      { useHash: false } // <-- debugging purposes only
    ),
    HttpClientModule,
    HttpModule,
    /*AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCbGweF_ofbxJlQW0x7DOkfdhuJGY9-2Vo'
    }),*/
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'it-IT' }, JsonReaderService,


  { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro }, RequestCacheService,


  {
    provide: HTTP_INTERCEPTORS,
    useClass: Interceptor,
    multi: true,
  },

  { provide: APP_INITIALIZER, useFactory: (jsonInjector), deps: [JsonReaderService], multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [MatSpinner, GenericDialogComponent, CreateUserComponent, OperationsListComponent]
})
export class AppModule { }

export function jsonInjector(config: JsonReaderService) {
  return () => config.load();
}


