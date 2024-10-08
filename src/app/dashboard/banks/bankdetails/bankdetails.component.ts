

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { TransactionService } from '../../transaction.service';

import { TypePartyStatement } from '../../types/TypePartyStatement';
import { BroadcastserviceService } from '../../broadcast.service';
import { Subscription, filter } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { AppGlobalsService } from '../../app-globals.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToWords } from 'to-words';
import { TypeBanks } from '../../types/TypeBanks';
import { BankService } from '../bank.service';


@Component({
  selector: 'app-bankdetails',
  templateUrl: './bankdetails.component.html',
  styleUrls: ['./bankdetails.component.css']
})
export class BankdetailsComponent implements OnInit {

  //@Input() Party: TypeParties = {} as TypeParties;  

  BankSno: number = 0;
  Bank!: TypeBanks;
  Bank_Name: string = "";

  TotalCreditAmount: number = 0;
  TotalDebitAmount: number = 0;
  BalanceInWords: string = "";
  
  StatementList: TypePartyStatement[] = [];
  subscriptionName: Subscription;
  
  MainReportActive: boolean = true;
  RpHistoryActive: boolean = false;
  
  constructor(private _snackBar: MatSnackBar, private actRoute: ActivatedRoute,private globals: AppGlobalsService, private bcastSerivce:BroadcastserviceService,private BnkService: BankService, private TransService: TransactionService, public dialog: MatDialog, ) 
  {    
    this.BankSno = this.actRoute.snapshot.params['bnk'];
    
    this.subscriptionName= this.bcastSerivce.getUpdate().subscribe
    (message => { //message contains the data sent from service              
      if (message.changed == true)
      {
        this.LoadTransactions();
      }
      
    });

   } 
   
  displayedColumns: string[] = [ 'Trans_Date', 'Particulars', 'CrAmount', 'DrAmount'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  DetailMode: boolean = false; 
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  ngOnInit(): void {    
    console.log (this.BankSno);
    this.BnkService.getBanks(this.BankSno,0).subscribe((data:any ) =>  {    
      
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
      }
      else{              
         this.Bank = data[0];                                         
         this.LoadTransactions();
      }              
    })
    
  }

  LoadTransactions() 
   {   
    console.log (this.Bank) ;
    const dialogRef = this.dialog.open(MsgboxComponent, 
      {
        data: { "DialogType": 0}}
      );
      dialogRef.disableClose = true;

     this.TransService.getBankStatement(this.Bank.BankSno).subscribe((data:any ) =>  {             
       this.loadingData = false;
       if (data === 0)
       {
         this.dataError  = true;
         this.errDetails = data;
         dialogRef.close();
       }
       else{                 

        this.StatementList = JSON.parse (data.apiData);
        this.TotalCreditAmount = data.CrAmount;
        this.TotalDebitAmount = data.DrAmount;
        
        this.dataSource = new MatTableDataSource<any> (JSON.parse(data.apiData));            
        setTimeout(() => this.dataSource.paginator = this.paginator);
        setTimeout(() => this.dataSource.sort = this.sort);   
        dialogRef.close();           
        const toWords = new ToWords({
          localeCode: 'en-IN',
          converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
            doNotAddOnly: false,
            currencyOptions: { // can be used to override defaults for the selected locale
              name: 'Rupee',
              plural: 'Rupees',
              symbol: '₹',
              fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: '',
              },
            }
          }
        });

        this.BalanceInWords = toWords.convert(this.TotalDebitAmount - this.TotalCreditAmount);

       }      
     });    
     this.loadingData = false;
   }

  
   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  CrAmountTotal()
  {
    return this.dataSource.filteredData.map(t =>  t.CrAmount).reduce((acc, value) => acc + value, 0);
  }

  DrAmountTotal()
  {
    return this.dataSource.filteredData.map(t => t.DrAmount).reduce((acc, value) => acc + value, 0);
  }
  CrWeightTotal()
  {
    return this.dataSource.filteredData.map(t => t.CrWeight).reduce((acc, value) => acc + value, 0);
  }
  DrWeightTotal()
  {
    return this.dataSource.filteredData.map(t => t.DrWeight).reduce((acc, value) => acc + value, 0);
  }


  OpenRpHistory(){
    this.RpHistoryActive = true;
    this.MainReportActive = false;    
  }
   
  OpenMainReport(){
    this.RpHistoryActive = false;
    this.MainReportActive = true;
  }

}

