
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionService } from '../transaction.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-goldrates',
  templateUrl: './goldrates.component.html',
  styleUrls: ['./goldrates.component.css']
})
export class GoldratesComponent implements OnInit {

  GoldRate: number = 0;
  PureRate: number = 0;

  constructor(public dialogRef: MatDialogRef<GoldratesComponent>, @Inject(MAT_DIALOG_DATA) public data: any,private TransService: TransactionService,private _snackBar: MatSnackBar ) {
    
   }

  ngOnInit(): void {    
    this.TransService.getGoldRates().subscribe(data => {
      this.GoldRate = data.GoldRate;
      this.PureRate = data.PureRate;
    });
  } 

  SaveGoldRate()
  {
    this.TransService.saveGoldRates(this.GoldRate,this.PureRate).subscribe(data=>{
      console.log (data);
      // this._snackBar.open('Gold Rates updated successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });            
      // this.dialogRef.close();
    })
  }

}
