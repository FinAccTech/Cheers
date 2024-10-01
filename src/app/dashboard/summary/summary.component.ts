import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { TransactionService } from '../transaction.service';
import { MsgboxComponent } from '../msgbox/msgbox.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  btnDisabled: boolean  = false;
  PureWt: number = 0;
  Sale_Value: number = 0;
  Release_Value: number = 0;
  Ratio: number = 0;
  RpGrams: number = 0;
  NonRpGrams: number = 0;
  RpValue: number = 0;

  RpGramsBwr: number = 0;
  RpvalueBwr: number = 0;
  Principal_Paid: number = 0;
  Interest_Paid: number = 0;
  Other_Charges: number = 0;

  StkWt916: number = 0;
  StkNon916: number = 0;
  StkRpGrams: number = 0;
  StkNonRpGrams: number = 0;


  SelectedIndex: number = 0;
  @ViewChild(MatTabGroup)  tabGroup!: MatTabGroup;
  
  constructor(private dialog: MatDialog, private cookies: CookieService, private transService: TransactionService) { }

  ngOnInit(): void {
    this.SelectedIndex  = parseInt (this.cookies.get('dashTabIndex'));
    
    this.transService.getCustomerAnalysisConsolidated().subscribe(dataRecd => {
      let data = JSON.parse (dataRecd.apiData);      
      this.PureWt = data[0].PureWt;
      this.Sale_Value = data[0].Sale_Value;
      this.Release_Value = data[0].Release_Value;
      this.Ratio = data[0].Ratio;
      this.RpGrams = data[0].RpGrams;
      this.NonRpGrams = data[0].NonRpGrams;
      this.RpValue = data[0].RpValue;
    });

    this.transService.getBorrowerAnalysisConsolidated().subscribe(dataRecd => {
      let data = JSON.parse (dataRecd.apiData);      
        this.RpGramsBwr = data[0].RpGrams
        this.RpvalueBwr = data[0].RpValue;
        this.Principal_Paid = data[0].Principal_Paid;
        this.Interest_Paid = data[0].Interest_Paid;
        this.Other_Charges = data[0].Other_Charges;
    });

    this.transService.LoadStockSummary().subscribe(dataRecd => {
      let data = JSON.parse (dataRecd.apiData);      
        this.StkWt916 = data[0].Wt916;
        this.StkNon916 = data[0].Non916Wt;
        this.StkRpGrams = data[0].RpGrams;
        this.StkNonRpGrams = data[0].NonRpGrams;
    });
  }

PostInterestForAll()
{  
  const dialogRef1 = this.dialog.open(MsgboxComponent, 
    {
    data: {DialogType:3, Message: "Are you sure you want to Post Interest for this Customer?"},
    });
    
    dialogRef1.disableClose = true; 

    dialogRef1.afterClosed().subscribe(actionBack => {        
      if (actionBack == 1) 
      { 
        const progressdialogRef = this.dialog.open(MsgboxComponent, 
          {
            data: { "DialogType": 0}}
          ); 
          progressdialogRef.disableClose = true;

        this.btnDisabled  = true;
        this.transService.InterestPostingForAll().subscribe((data:any ) => {
    
          progressdialogRef.close();
          if (data.queryStatus == 0)
          {                      
              const dialogRef2 = this.dialog.open(MsgboxComponent, 
                {
                data: {DialogType:1, Message: data.apiData},
                });
                
                dialogRef2.disableClose = true; 
          }
          else
          { 
            this.btnDisabled  = false;
            const dialogRef2 = this.dialog.open(MsgboxComponent, 
              {
              data: {DialogType:1, Message: "Interest Posted successfully for all Customers"},
              });
              
              dialogRef2.disableClose = true; 
          }          
        });
      }
      
    });   

 
}

}
