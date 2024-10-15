import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { TransactionService } from '../transaction.service';

@Component({
  selector: 'app-indexpage',
  templateUrl: './indexpage.component.html',
  styleUrls: ['./indexpage.component.css']
})
export class IndexpageComponent implements OnInit {

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
 

  SelectedIndex: number = 0;
  @ViewChild(MatTabGroup)  tabGroup!: MatTabGroup;
  
  constructor(private cookies: CookieService, private transService: TransactionService) { }

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
  }

  SetSelectedIndex($event: any)
  {    
    this.cookies.set('dashTabIndex', $event.index);    
  }
}
