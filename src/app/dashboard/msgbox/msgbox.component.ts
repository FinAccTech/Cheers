
import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DialogData {
  DialogType: number; // 0-Progress 1-Error 2-Information 3- Question
  Message: string;    
}

@Component({
  selector: 'app-msgbox',
  templateUrl: './msgbox.component.html',
  styleUrls: ['./msgbox.component.css']
})
export class MsgboxComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MsgboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  CloseDialog (action: number)
  {
    this.dialogRef.close(action);
  }

  @HostListener("keydown.esc") 
  public onEsc() {
    this.dialogRef.close();
  }
}
