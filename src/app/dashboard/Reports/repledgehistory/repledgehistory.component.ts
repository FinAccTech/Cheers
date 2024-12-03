import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
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
import { ImageCarouselComponent } from '../../image-carousel/image-carousel.component';
import { Overlay } from '@angular/cdk/overlay';

interface RpStatus { 
  value : number;
  text: string;
} 

@Component({
  selector: 'app-repledgehistory',
  templateUrl: './repledgehistory.component.html',
  styleUrls: ['./repledgehistory.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ], 
})
export class RepledgehistoryComponent implements OnInit {

  RpStatusList: RpStatus[] = [
    {value: 0, text: "All"},
    {value: 1, text: "Live"},
    {value: 2, text: "Closed"},
    {value: 3, text: "Overdue"}
  ];

  SelectedRpStatus = this.RpStatusList[1].value;

  @ViewChild('TABLE')  table!: ElementRef;
  @ViewChild('datesel') dateselbtn!: ElementRef;

  @Input()  PartySno!: number;
  
  AllCustomers: boolean = true;
  ShowPartyName: boolean = false;

  constructor(private overlay: Overlay, private globals: AppGlobalsService, private PartyService: PartyService, private dialog: MatDialog, private TransService: TransactionService) { }

  Customers: TypeParties[] =[]; 
  StatementList: TypeRepledges[] = [];

  dataError: boolean = false;
  errDetails: string = "";  
  loadingData: boolean = false;

  displayedCustColumns: string[] = ['Party_Name'];
  dataSourceCust!: MatTableDataSource<TypeParties>;

  TotalAmount: number = 0;
  PrincipalPaid: number = 0;
  InterestPaid: number = 0;
  BalanceAmount: number = 0;

  AvailableWeight: number = 0;
  RpWeight: number = 0;
  BalWeight: number = 0;


  ReportFromDate: Date  = new Date();
  ReportToDate: Date  = new Date();
 
  //dataSource = this.StatementList;

  dataSource!: MatTableDataSource<TypeRepledges>;
  //columnsToDisplay = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = ['RpStatus', 'ImgCount', 'Trans_No','Trans_Date', 'Duration', 'Tenure','Party_Name', 'Borrower_Name','Bank_Name', 'Branch_Name','Roi','CrAmount','DrAmount','Balance' ,'CrWeight','DrWeight'];
  columnsToDisplayWithExpand = ['expand', ...this.columnsToDisplay];
  expandedElement!: TypeRepledges | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  
  ngOnInit(): void {
    if (!this.PartySno)
    {
      this.PartySno = 0;
    }
    if (this.PartySno == 0)
    {
      this.AllCustomers = true;
      this.LoadCustomers();    
    }    
    else
    {
      this.AllCustomers = false;
      this.LoadRepledgeHistory(this.PartySno);
    }
  }

  ngAfterViewInit(){
 
  }

  LoadCustomers()
  {    
    this.PartyService.getParties(0,1).subscribe((data:any )  =>   {           
      this.Customers     = (data);  
      this.dataSourceCust = new MatTableDataSource<TypeParties> (data);            
    });        
  }

  LoadRepledgeHistory(PartySno: number) 
  {    
    if (PartySno == 0)
    {      
      this.ShowPartyName = true;
    } else {
      this.ShowPartyName = false;     
    }
    
   const dialogRef = this.dialog.open(MsgboxComponent, 
     {
       data: { "DialogType": 0}}
     );
     dialogRef.disableClose = true;

    this.TransService.getRepledgeHistory(PartySno).subscribe((data:any ) =>  {          
      console.log(data);
                    
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
    this.dataSourceCust.filter = filterValue.trim().toLowerCase();
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
