import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  MatButtonModule, MatNativeDateModule, MatIconModule, MatSidenavModule,
  MatListModule, MatToolbarModule, MatCardModule, MatInputModule, MatSelectModule, MatDatepickerModule, 
  MatProgressSpinnerModule, MatSliderModule, MatTableModule, MatGridListModule, MatPaginatorModule, MatSortModule, MatDialogModule
} from '@angular/material';

@NgModule({
  imports: [CommonModule, OverlayModule, MatDialogModule, MatGridListModule, MatSortModule, MatPaginatorModule, MatTableModule, MatSliderModule, MatProgressSpinnerModule, MatDatepickerModule, MatButtonModule,MatToolbarModule, MatNativeDateModule, MatIconModule, MatSidenavModule, MatListModule, MatCardModule, MatInputModule,MatSelectModule],
  exports: [CommonModule, OverlayModule, MatDialogModule, MatGridListModule, MatSortModule, MatPaginatorModule, MatTableModule, MatSliderModule, MatProgressSpinnerModule, MatDatepickerModule, MatButtonModule, MatToolbarModule, MatNativeDateModule, MatIconModule, MatSidenavModule, MatListModule, MatCardModule, MatInputModule, MatSelectModule],
})
export class CustomMaterialModule { }
