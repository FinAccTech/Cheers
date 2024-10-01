import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TypeTransactions } from '../../types/TypeTransactions';
import { TransactionService } from '../../transaction.service';
import { TypeParties } from '../../types/TypeParties';
import { BroadcastserviceService } from '../../broadcast.service';
import { Subscription, filter } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PartyService } from '../../party.service';
import { AppGlobalsService } from '../../app-globals.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToWords } from 'to-words';
import { RepledgeComponent } from '../repledge/repledge.component';
import { TypeRepledges } from '../../types/TypeRepledges';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RppaymentComponent } from '../repledge/rppayment/rppayment.component';
import { ReleaseComponent } from '../repledge/release/release.component';
import { TransferComponent } from '../repledge/transfer/transfer.component';
import * as XLSX from 'xlsx';
import { ImageCarouselComponent } from '../../image-carousel/image-carousel.component';
import { DateSelectionComponent } from '../../date-selection/date-selection.component';
import { Overlay } from '@angular/cdk/overlay';
import { BorrowermasterComponent } from '../borrowermaster/borrowermaster.component';

interface RpStatus {
  value : number;
  text: string;
} 


@Component({
  selector: 'app-borrowerdetails',
  templateUrl: './borrowerdetails.component.html',
  styleUrls: ['./borrowerdetails.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ], 
  
})
export class BorrowerdetailsComponent implements OnInit {

  RpStatusList: RpStatus[] = [
    {value: 0, text: "All"},
    {value: 1, text: "Live"},
    {value: 2, text: "Closed"},
    {value: 3, text: "Overdue"}
  ];

  SelectedRpStatus = this.RpStatusList[0].value;

  //@Input() Party: TypeParties = {} as TypeParties;  
  @ViewChild('TABLE')  table!: ElementRef;
  @ViewChild('datesel') dateselbtn!: ElementRef;
  
  PartySno: number = 0; 
  Party!: TypeParties;
  Party_Name: string = "";

  PendingRp: number = 0;
  PendingRpAmount: number = 0;    
  PendingTransfers: number = 0;
  PendingTransferAmt: number = 0;
  TotalRpWeight: number = 0;
  PrincipalPaid: number = 0;
  InterestPaid: number  = 0;

  StatementList: TypeRepledges[] = [];
  subscriptionName: Subscription;

  MainReportActive: boolean = true;  
  ImageGalleryActive: boolean = false;

  ReportFromDate: Date  = new Date();
  ReportToDate: Date  = new Date();

  constructor( private overlay: Overlay, private _snackBar: MatSnackBar, private actRoute: ActivatedRoute,private globals: AppGlobalsService, private bcastSerivce:BroadcastserviceService,private PtyService: PartyService, private TransService: TransactionService, public dialog: MatDialog, ) 
  {    
    this.PartySno = this.actRoute.snapshot.params['bwr'];
    
    this.subscriptionName= this.bcastSerivce.getUpdate().subscribe
    (message => { //message contains the data sent from service              
      if (message.changed == true)
      {
        this.LoadTransactions();
      }
      
    });

   }  
   
   //dataSource = this.StatementList;
   dataSource!: MatTableDataSource<TypeRepledges>;
   //columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
   columnsToDisplay: string[] = ['RpStatus', 'ImgCount', 'Trans_No','Trans_Date', 'Duration', 'Tenure', 'Party_Name','Bank_Name', 'Branch_Name','Roi','CrAmount','DrAmount','CrWeight','DrWeight'];
   columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];
   expandedElement!: TypeRepledges | null;

  //displayedColumns: string[] = ['RpStatus','Trans_No','Trans_Date', 'Duration', 'Tenure', 'Series_Name', 'Party_Name','Bank_Name', 'Branch_Name','Roi','CrAmount','DrAmount','CrWeight','DrWeight'];
  //dataSource!: MatTableDataSource<TypeTransactions>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  DetailMode: boolean = false; 
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;   
 
  ngOnInit(): void {     
    
    this.ReportFromDate = this.globals.MonthFirstDate (new Date());
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

  OpenRepledegeCreation()
  {
    var Rp: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VtypRepledge, Series_Name: "Repledge"},
      Party:  {PartySno: 0, Party_Name: ""},
      Borrower: {BorrowerSno: this.Party.PartySno, Borrower_Name: this.Party.Party_Name},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 1,
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

    const dialogRef = this.dialog.open(RepledgeComponent, 
      {
       data: {Rp},
      }); 
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }
  
  OpenTransferCreation()
  {
    var Trf: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VtypTransfer, Series_Name: "Transfer"},
      Party:  {PartySno: 0, Party_Name: ""},
      Borrower: {BorrowerSno: this.Party.PartySno, Borrower_Name: this.Party.Party_Name},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 1,
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

    const dialogRef = this.dialog.open(TransferComponent, 
      {
       data: {Trf},
      }); 
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }

  OpenVoucherCreation()
  {

  }

  LoadTransactions() 
   {
    const dialogRef = this.dialog.open(MsgboxComponent, 
      {
        data: { "DialogType": 0}}
      );
      dialogRef.disableClose = true;

     this.TransService.getBorrowerTransactions(this.Party.PartySno, this.ReportFromDate, this.ReportToDate).subscribe((data:any ) =>  {             
       this.loadingData = false;       
       if (data === 0)
       {
         this.dataError  = true;
         this.errDetails = data;
         dialogRef.close();
       }
       else{                 

        this.StatementList = JSON.parse (data.apiData);
        console.log (this.StatementList);

        this.PendingRp = data.PendingRp;
        this.PendingRpAmount = data.PendingRpAmount;
        this.PendingTransfers = data.PendingTransfers;
        this.PendingTransferAmt = data.PendingTransferAmt;
        this.TotalRpWeight = data.TotalRpWeight;
        this.PrincipalPaid = data.PrincipalPaid;
        this.InterestPaid = data.InterestPaid;

        this.dataSource = new MatTableDataSource<TypeRepledges> (JSON.parse(data.apiData));            
        //this.dataSource = this.StatementList;
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

        //this.BalanceInWords = toWords.convert(this.TotalDebitAmount - this.TotalCreditAmount);

       }      
     });    
     this.loadingData = false;
   }
 
  LoadTransaction(Trans: TypeRepledges)
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
        case this.globals.VtypRepledge:
          var Rp: TypeTransactions;          
          Rp = data[0];           
          const dialogRef = this.dialog.open(RepledgeComponent, 
            {
             data: {Rp}, 
            });
            
            dialogRef.disableClose = true;
      
            dialogRef.afterClosed().subscribe(result => {     
              
            }); 
          break;

        case this.globals.VTypRpPayment:
            var Rpp: TypeTransactions;          
            Rpp = data[0];           
            const rppdialogRef = this.dialog.open(RppaymentComponent, 
              {
               data: {Rpp}, 
              });
              
              rppdialogRef.disableClose = true;
        
              rppdialogRef.afterClosed().subscribe(result => {     
                
              }); 
            break;
          
          case this.globals.VtypRelease:
              var Rel: TypeTransactions;          
              Rel = data[0];           
              const reldialogRef = this.dialog.open(ReleaseComponent, 
                {
                 data: {Rel}, 
                });
                
                reldialogRef.disableClose = true;
          
                reldialogRef.afterClosed().subscribe(result => {     
                  
                }); 
              break;
      }
      }      
    });     

    
   }
   applyFilter(event: Event) {    
    const filterValue = (event.target as HTMLInputElement).value;    
    console.log(this.dataSource.filteredData.length);
    this.dataSource.filter = filterValue.trim().toLowerCase();    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  CrAmountTotal()
  { 
    try {
      return this.dataSource.filteredData.map(t =>  t.CrAmount).reduce((acc, value) => acc + value, 0);        
    } catch (error) {
      return 0;  
    }
  }

  DrAmountTotal()
  {
    try {
      return this.dataSource.filteredData.map(t =>  t.DrAmount).reduce((acc, value) => acc + value, 0);        
    } catch (error) {
      return 0;  
    }
  }
  CrWeightTotal()
  {
    try {
      return this.dataSource.filteredData.map(t =>  t.CrWeight).reduce((acc, value) => acc + value, 0);        
    } catch (error) {
      return 0;  
    }
  }
  DrWeightTotal()
  {
    try {
      return this.dataSource.filteredData.map(t =>  t.DrWeight).reduce((acc, value) => acc + value, 0);        
    } catch (error) {
      return 0;  
    }
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

OpenMainReport(){  
  this.MainReportActive = true;
  this.ImageGalleryActive = false;
}
 
OpenImagegallery(){  
  this.MainReportActive = false;
  this.ImageGalleryActive = true;
}

exportAsExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'Statement.xlsx');
}

OpenSlideshow(element: any)
{  
  let imgData = {"TransSno": element.TransSno, "Heading": element.Trans_No, "ImgDetails" :this.globals.date_To_String (this.globals.IntToDate(element.Trans_Date)) + ', ' + element.Party_Name + ', Bwr:' + element.Borrower_Name + ', ' + element.Bank_Name + ', ' + element.Branch_Name };
  
  const dialogRef = this.dialog.open(ImageCarouselComponent, 
    {
     data: imgData, 
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {     
      
    }); 
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

AlterCustomer()
{
  let Bwr = this.Party;
  // console.log (Pty);
  const dialogRef = this.dialog.open(BorrowermasterComponent, 
    {
      data: {Bwr},
    });
    
    dialogRef.disableClose = true; 

    dialogRef.afterClosed().subscribe(result => {              
      if (result)      {
        this.Party = result;
      }
    });  
}

}
