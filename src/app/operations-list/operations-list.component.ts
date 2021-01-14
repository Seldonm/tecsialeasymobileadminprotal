import { OnInit } from '@angular/core';
import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { GenericCallService } from "../services/generic-call/generic-call.service";


@Component({
  selector: 'app-operations-list',
  templateUrl: './operations-list.component.html',
  styleUrls: ['./operations-list.component.css']
})

export class OperationsListComponent implements OnInit {

  operations = [];

  constructor(
    private genericCall: GenericCallService,
    public dialogRef: MatDialogRef<OperationsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.operations = data.operations;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }



  ngOnInit() {
  }

}
