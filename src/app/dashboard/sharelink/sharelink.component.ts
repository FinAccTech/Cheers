import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MsgboxComponent } from '../msgbox/msgbox.component';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.css']
})
export class SharelinkComponent implements OnInit {

  LinkData: string = "";
  ImageType: string = "with";

  constructor(public dialogRef: MatDialogRef<SharelinkComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, private TransService: TransactionService) { }

  ngOnInit(): void {
    
    //this.LinkData = this.data;
    //console.log (this.data);
  }

  CreateLink(){
    const dialogRef1 = this.dialog.open(MsgboxComponent, 
      {
        data: { "DialogType": 0}}
      ); 
      dialogRef1.disableClose = true;

    this.TransService.sharePartyStatement(this.data.AccountSno, this.data.PartyName,this.data.ReportFromDate, this.data.ReportToDate, this.ImageType ).subscribe(data => {
      dialogRef1.close();
      this.LinkData = data.apiData;
    });
  }

  closeDialog() {
    window.open(this.LinkData, "_blank");
    this.dialogRef.close();
  }
}
