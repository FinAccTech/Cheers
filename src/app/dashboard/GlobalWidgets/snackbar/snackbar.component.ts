
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})

@AutoUnsubscribe
export class SnackbarComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SnackbarComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any,        
  ) 
  {

  }

  ngOnInit(): void {    
    
  }


  CloseDialog()  {
    this.dialogRef.close();
  }

  
}
