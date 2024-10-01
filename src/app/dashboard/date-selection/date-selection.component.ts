import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-date-selection',
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.css']
})
export class DateSelectionComponent implements OnInit {

  fromSelected!: Date | null;
  toSelected!: Date | null;
  
  constructor(public dialogRef: MatDialogRef<DateSelectionComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
    this.fromSelected = new Date();
    this.toSelected = new Date();
  }

  closeDialog() {
    this.dialogRef.close( {"fromDate": this.fromSelected, "toDate": this.toSelected } );
  }
}
