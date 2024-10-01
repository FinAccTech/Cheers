import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TypeTransactions } from '../../types/TypeTransactions';
import { TransactionService } from '../../transaction.service';
import { TypeParties } from '../../types/TypeParties';
import { TypePartyStatement } from '../../types/TypePartyStatement';
import { BroadcastserviceService } from '../../broadcast.service';
import { Subscription, filter } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PaymentComponent } from '../payment/payment.component';
import { ReceiptComponent } from '../receipt/receipt.component';
import { PartyService } from '../../party.service';
import { AppGlobalsService } from '../../app-globals.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToWords } from 'to-words';
import { VoucherComponent } from '../voucher/voucher.component';
import * as XLSX from 'xlsx';
import { ImageCarouselComponent } from '../../image-carousel/image-carousel.component';
import { FormControl, FormGroup } from '@angular/forms';
import { DateSelectionComponent } from '../../date-selection/date-selection.component';
import { Overlay } from '@angular/cdk/overlay';
import { CustomermasterComponent } from '../customermaster/customermaster.component';
import { SharelinkComponent } from '../../sharelink/sharelink.component';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {

  //@Input() Party: TypeParties = {} as TypeParties;  
  
  @ViewChild('TABLE')  table!: ElementRef;
  @ViewChild('datesel') dateselbtn!: ElementRef;
  @ViewChild('sharesel') shareselbtn!: ElementRef;
  
  PartySno: number = 0; 
  Party!: TypeParties;
  Party_Name: string = "";

  TotalCreditAmount: number = 0;
  TotalDebitAmount: number = 0;
  BalanceInWords: string = "";
  
  TotalCreditWeight: number = 0;
  TotalDebitWeight: number = 0;

  SaleValue: number = 0
  ReleaseValue: number = 0
  Difference: number = 0
  Ratio: number = 0

  DateButtonLeft: number = 0;
  DateButtonTop: number = 0;

  StatementList: TypePartyStatement[] = [];
  subscriptionName: Subscription; 
  
  ReportFromDate: Date  = new Date();
  ReportToDate: Date  = new Date();

  constructor( private overlay: Overlay, private _snackBar: MatSnackBar, private actRoute: ActivatedRoute,private globals: AppGlobalsService, private bcastSerivce:BroadcastserviceService,private PtyService: PartyService, private TransService: TransactionService, public dialog: MatDialog, ) 
  {    
    this.PartySno = this.actRoute.snapshot.params['cust']; 
    
    this.subscriptionName= this.bcastSerivce.getUpdate().subscribe
    (message => { //message contains the data sent from service              
      if (message.changed == true)
      {
        this.LoadTransactions();
      }
      
    });

   } 
   
  displayedColumns: string[] = [ 'RowNo','ImgCount', 'Trans_Date', 'Particulars', 'Bank_Name','CrAmount', 'DrAmount','IntAccured','IntPaid','PrinBalance','Balance', 'CrWeight','DrWeight','BalanceWt' ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  DetailMode: boolean = false; 
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  MainReportActive: boolean = true;
  RpHistoryActive: boolean = false;
  ImageGalleryActive: boolean = false;

  ngOnInit(): void {    

    this.PtyService.getParties(this.PartySno,0).subscribe((data:any ) =>  {                    
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
        this.ReportFromDate = this.globals.MonthFirstDate (new Date());
      }
      else{              
         this.ReportFromDate = this.globals.IntToDate (data[0].TransFirstDate);
         this.Party = data[0];                                         
         this.LoadTransactions();
      }              
    })
    
  }

  ngAfterViewInit() {    
    
  }

  OpenPaymentCreation()
  {
    var Pmt: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VtypPayment, Series_Name: "Payment"},
      Party:  {PartySno: this.Party.PartySno, Party_Name: this.Party.Party_Name},
      Borrower: {BorrowerSno: 0, Borrower_Name: ""},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 0,
      Roi: this.Party.Roi,
      Tenure: 0,    
      DrAmount: 0,
      CrAmount: 0,
      PrincipalAmount: 0,
      IntAmount: 0,
      Other_Charges: 0,
      Ref: {RefSno: 0, Ref_No: ""},
      Remarks: "",
      GrossWt: 0,
      NettWt: 0,
      Purity: 91.6,
      N916GrossWt: 0, 
      N916NettWt: 0,
      N916Purity: 75,
      fileSource: []
    }

    const dialogRef = this.dialog.open(PaymentComponent, 
      {
       data: {Pmt},
      }); 
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }
  
  OpenReceiptCreation()
  { 
    var Rcpt: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VTypReceipt, Series_Name: "Receipt"},
      Party:  {PartySno: this.Party.PartySno, Party_Name: this.Party.Party_Name},
      Borrower: {BorrowerSno: 0, Borrower_Name: ""},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 0,
      Roi: 0,
      Tenure: 0,
      DrAmount: 0,
      CrAmount: 0,
      PrincipalAmount: 0,
      IntAmount: 0,
      Other_Charges: 0,
      Ref: {RefSno: 0, Ref_No: ""},
      Remarks: "",
      GrossWt: 0,
      NettWt: 0,
      Purity: 91.6,
      N916GrossWt: 0,
      N916NettWt: 0,
      N916Purity: 75,
      fileSource:[]
    }

      const dialogRef = this.dialog.open(ReceiptComponent, 
      {
       data: {Rcpt},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }

  OpenVoucherCreation()
  {
    var Vou: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VtypVoucher, Series_Name: "Voucher"},
      Party:  {PartySno: this.Party.PartySno, Party_Name: this.Party.Party_Name},
      Borrower: {BorrowerSno: 0, Borrower_Name: ""},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 0,
      Roi: 0,
      Tenure: 0,
      DrAmount: 0,
      CrAmount: 0,
      PrincipalAmount: 0,
      IntAmount: 0,
      Other_Charges: 0,
      Ref: {RefSno: 0, Ref_No: ""},
      Remarks: "",
      GrossWt: 0,
      NettWt: 0,
      Purity: 91.6,
      N916GrossWt: 0,
      N916NettWt: 0,
      N916Purity: 75,
      fileSource:[]
    }

      const dialogRef = this.dialog.open(VoucherComponent, 
      {
       data: {Vou},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }

  LoadTransactions() 
   {    
    const dialogRef = this.dialog.open(MsgboxComponent, 
      {
        data: { "DialogType": 0}}
      ); 
      dialogRef.disableClose = true;

     this.TransService.getPartyStatement(this.Party.PartySno, this.ReportFromDate, this.ReportToDate ).subscribe((data:any ) =>  {             
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
        this.TotalCreditWeight = data.CrWeight;
        this.TotalDebitWeight = data.DrWeight;
        this.SaleValue = data.SaleValue;
        this.ReleaseValue = data.ReleaseValue;
        this.Difference = data.Difference;
        this.Ratio = data.Ratio;

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

  LoadTransaction(Trans: TypePartyStatement)
   {
    this.TransService.getTransactions(Trans.TransSno, 0).subscribe((data:any ) =>  {             
      this.loadingData = false;
      
      if (data === 0)
      {        
        alert  (data);
        return;
      }
      else{                         
        data[0].Trans_Date = this.globals.IntToDate(data[0].Trans_Date);    
       switch (Trans.SeriesSno) {
        case this.globals.VtypPayment:
          var Pmt: TypeTransactions;          
          Pmt = data[0];           
          const dialogRef = this.dialog.open(PaymentComponent, 
            {
             data: {Pmt}, 
            });
            
            dialogRef.disableClose = true;
      
            dialogRef.afterClosed().subscribe(result => {     
              
            }); 
          break;
        case this.globals.VTypReceipt:
            var Rcpt: TypeTransactions;
            Rcpt = data[0];           
            const dialogRefRcpt = this.dialog.open(ReceiptComponent, 
              {
               data: {Rcpt},
              });
              
              dialogRefRcpt.disableClose = true;
        
              dialogRefRcpt.afterClosed().subscribe(result => {     
                
              }); 
            break;

        case this.globals.VtypVoucher:
              var Vou: TypeTransactions;
              Vou = data[0];           
              const dialogRefVou = this.dialog.open(VoucherComponent, 
                {
                 data: {Vou},
                });
                
                dialogRefVou.disableClose = true;
          
                dialogRefVou.afterClosed().subscribe(result => {     
                  
                }); 
              break;
      }
      }      
    });    

    
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
  IntAccuredTotal()
  {
    return this.dataSource.filteredData.map(t => t.IntAccured).reduce((acc, value) => acc + value, 0);
  }
  IntPaidTotal()
  {
    return this.dataSource.filteredData.map(t => t.IntPaid).reduce((acc, value) => acc + value, 0);
  }

  InterestPosting(PostMethod: number, AsonType: number){       
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to Post Interest for this Customer?"},
        });
        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.InterestPosting(this.Party.PartySno,PostMethod, AsonType).subscribe((data:any ) => {
        
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
                  this.LoadTransactions();
              }          
            });
          }
          
        });      
  }

  ClearPosting(){         
   
    const dialogRef1 = this.dialog.open(MsgboxComponent, 
      {
      data: {DialogType:3, Message: "Are you sure you want to Clear Interest postings for this Customer?"},
      });
      
      dialogRef1.disableClose = true; 

      dialogRef1.afterClosed().subscribe(actionBack => {        
        if (actionBack == 1) 
        { 
          this.TransService.ClearPosting(this.Party.PartySno).subscribe((data:any ) => {
      
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
              const dialogRef3 = this.dialog.open(MsgboxComponent, 
                {
                data: {DialogType:2, Message: "Interest postings cleared successfully"},
                });
                
                dialogRef3.disableClose = true;                   
                this.LoadTransactions();
            }          
          });
        }
        
      });  

    
  
  
}

OpenRpHistory(){
  this.RpHistoryActive = true;
  this.MainReportActive = false;
  this.ImageGalleryActive = false;
}
 
OpenImagegallery(){
  this.RpHistoryActive = false;
  this.MainReportActive = false;
  this.ImageGalleryActive = true;
}

OpenMainReport(){
  this.RpHistoryActive = false;
  this.MainReportActive = true;
  this.ImageGalleryActive = false;
}

OpenSlideshow(element: any)
{  
  let imgData = {"TransSno": element.TransSno, "Heading": element.Particulars, "ImgDetails" :element.Particulars};
  const dialogRef = this.dialog.open(ImageCarouselComponent, 
    {
     data: imgData, 
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {     
      
    }); 
}

exportAsExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'Statement.xlsx');
}



OpenDateSelection(){
  const {x, y} = this.dateselbtn.nativeElement.getBoundingClientRect();
  const dialogRef = this.dialog.open(DateSelectionComponent, 
    {
      data: "", 
      height: '350px', 
      width: '400px',       
      position: {left:(x) +'px' , top: (y + 60) +'px'} ,
      scrollStrategy: this.overlay.scrollStrategies.noop()
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {     
      if (result)
      {
        this.ReportFromDate = new Date (result.fromDate);
        this.ReportToDate = new Date (result.toDate);
        this.LoadTransactions();
      }      
    }); 
}

OpenShareLink(){
 

       // console.log (data.apiData);
      // window.open(data.apiData, "_blank");
      const {x, y} = this.shareselbtn.nativeElement.getBoundingClientRect();
      const dialogRef = this.dialog.open(SharelinkComponent, 
        {
          data: {"PartySno": this.Party.PartySno, "PartyName" : this.Party.Party_Name, "ReportFromDate": this.ReportFromDate, "ReportToDate": this.ReportToDate }, 
          height: '280px', 
          width: '400px',       
          position: {left:(x-300) +'px' , top: (y + 60) +'px'} ,
          scrollStrategy: this.overlay.scrollStrategies.noop()
        });
        
        //dialogRef.disableClose = true;

        dialogRef.afterClosed().subscribe(result => {     
          // if (result)
          // {
          //   this.ReportFromDate = new Date (result.fromDate);
          //   this.ReportToDate = new Date (result.toDate);
          //   this.LoadTransactions();
          // }      
        }); 

  
  
}


AlterCustomer()
{
  let Cust = this.Party;
  // console.log (Pty);
  const dialogRef = this.dialog.open(CustomermasterComponent, 
    {
      data: {Cust},
    });
    
    dialogRef.disableClose = true; 

    dialogRef.afterClosed().subscribe(result => {              
      if (result)      {
        this.Party = result;
      }
    });  
}
}
