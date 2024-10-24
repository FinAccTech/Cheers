import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomermasterComponent } from '../customermaster/customermaster.component';

@Component({
  selector: 'app-moreinfo',
  templateUrl: './moreinfo.component.html',
  styleUrls: ['./moreinfo.component.css']
})
export class MoreinfoComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CustomermasterComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
    console.log(this.data);
    
  }

  UpdateSettings(){
    this.dialogRef.close(this.data);
  }
  CheckLength($event: any){
    if ($event.target.value.toString().length >4){
      $event.target.value='';
    }
  }
} 
