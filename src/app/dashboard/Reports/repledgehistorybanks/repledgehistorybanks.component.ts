import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TypeTransactions } from '../../types/TypeTransactions';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TypeRepledges } from '../../types/TypeRepledges';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from '../../transaction.service';
import { AppGlobalsService } from '../../app-globals.service';
import { RepledgeComponent } from '../../borrowers/repledge/repledge.component';
import { RppaymentComponent } from '../../borrowers/repledge/rppayment/rppayment.component';
import { ReleaseComponent } from '../../borrowers/repledge/release/release.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as XLSX from 'xlsx';
import { TypeBanks } from '../../types/TypeBanks';
import { BankService } from '../../banks/bank.service';
import { ImageCarouselComponent } from '../../image-carousel/image-carousel.component';

interface RpStatus {
  value : number;
  text: string;
} 

@Component({
  selector: 'app-repledgehistorybanks',
  templateUrl: './repledgehistorybanks.component.html',
  styleUrls: ['./repledgehistorybanks.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ], 
})
export class RepledgehistorybanksComponent implements OnInit {

  RpStatusList: RpStatus[] = [
    {value: 0, text: "All"},
    {value: 1, text: "Live"},
    {value: 2, text: "Closed"},
    {value: 3, text: "Overdue"}
  ];

  SelectedRpStatus = this.RpStatusList[1].value;

  @ViewChild('TABLE')  table!: ElementRef;
  
  @Input()  BankSno!: number;
  
  AllBanks: boolean = true;
  ShowBankName: boolean = false;
  constructor(private globals: AppGlobalsService, private BnkService: BankService, private dialog: MatDialog, private TransService: TransactionService) { }

  Banks: TypeBanks[] =[]; 
  StatementList: TypeRepledges[] = [];

  dataError: boolean = false;
  errDetails: string = "";  
  loadingData: boolean = false;

  displayedCustColumns: string[] = ['Bank_Name'];
  dataSourceBnk!: MatTableDataSource<TypeBanks>;

  TotalAmount: number = 0;
  PrincipalPaid: number = 0;
  InterestPaid: number = 0;
  BalanceAmount: number = 0;

  AvailableWeight: number = 0;
  RpWeight: number = 0;
  BalWeight: number = 0;

  //dataSource = this.StatementList;

  dataSource!: MatTableDataSource<TypeRepledges>;
  //columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = ['RpStatus', 'ImgCount', 'Trans_No','Trans_Date', 'Duration', 'Tenure','Party_Name', 'Borrower_Name','Bank_Name', 'Branch_Name','Roi','CrAmount','DrAmount','Balance','CrWeight','DrWeight'];
  columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];
  expandedElement!: TypeRepledges | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  
  ngOnInit(): void {
    if (!this.BankSno)
    {
      this.BankSno = 0;
    }
    if (this.BankSno == 0)
    {
      this.AllBanks = true;
      this.LoadBanks();    
    }    
    else
    {
      this.AllBanks = false;
      this.LoadRepledgeHistory(this.BankSno);
    }
  }

  LoadBanks()
  {    
    this.BnkService.getBanks(0,0).subscribe((data:any )  =>   {           
      this.Banks     = (data);  
      console.log (data);
      this.dataSourceBnk = new MatTableDataSource<TypeBanks> (data);            
    });        
  }

  LoadRepledgeHistory(BankSno: number) 
  {    
    if (BankSno == 0)
    {      
      this.ShowBankName = true;
    } else {
      this.ShowBankName = false;     
    }
    
   const dialogRef = this.dialog.open(MsgboxComponent, 
     {
       data: { "DialogType": 0}}
     );
     dialogRef.disableClose = true;

    this.TransService.getRepledgeHistoryBank(BankSno).subscribe((data:any ) =>  {          
                
      this.loadingData = false;       
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
        dialogRef.close();
      }
      else{                 

       this.StatementList = JSON.parse (data.apiData);     
       this.dataSource = new MatTableDataSource<TypeRepledges> (JSON.parse(data.apiData));            

       this.TotalAmount = data.PendingRpAmount;
       this.PrincipalPaid = data.PrincipalPaid;
       this.InterestPaid = data.InterestPaid;
       this.InterestPaid = data.InterestPaid;
       this.BalanceAmount = data.PendingRpAmount - data.PrincipalPaid;

       this.AvailableWeight = data.TotalWeight;
       this.RpWeight = data.TotalRpWeight;
       this.BalWeight = this.AvailableWeight - this.RpWeight;

       setTimeout(() => this.dataSource.paginator = this.paginator);
       setTimeout(() => this.dataSource.sort = this.sort);   
       dialogRef.close();           
       this.FilterByStatus();
       //this.BalanceInWords = toWords.convert(this.TotalDebitAmount - this.TotalCreditAmount);

      }      
    });    
    this.loadingData = false;
  }

  LoadTransaction(Trans: TypeRepledges)
  {   
   this.TransService.getTransactions(Trans.TransSno, 0).subscribe((data:any ) =>  {             
     this.loadingData = false;

     console.log (data);
     
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
    console.log (event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  FilterByStatus() {    
    if (this.SelectedRpStatus == 0) {
      this.dataSource.filterPredicate = (data: TypeRepledges, filter: string) => !filter || data.RpStatus > 0;  
    }
    else
    {
      this.dataSource.filterPredicate = (data: TypeRepledges, filter: string) => !filter || data.RpStatus == this.SelectedRpStatus;
    }  
    this.dataSource.filter = this.SelectedRpStatus.toString();
  }

  applyFilterCust(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBnk.filter = filterValue.trim().toLowerCase();
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

exportAsExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'BankRepledges.xlsx');
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

}
