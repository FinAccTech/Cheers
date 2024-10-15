import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionService } from '../transaction.service';
import { TypeTransactions } from '../types/TypeTransactions';
import { ImageCarouselComponent } from '../image-carousel/image-carousel.component';
import { AppGlobalsService } from '../app-globals.service';
import { RepledgeComponent } from '../borrowers/repledge/repledge.component';
import { RppaymentComponent } from '../borrowers/repledge/rppayment/rppayment.component';
import { ReleaseComponent } from '../borrowers/repledge/release/release.component';
import { PaymentComponent } from '../customers/payment/payment.component';
import { ReceiptComponent } from '../customers/receipt/receipt.component';
import { VoucherComponent } from '../customers/voucher/voucher.component';

import { EChartsOption } from 'echarts';

interface TypeChartDataList{
  Month: number;
  Amount: number;
}

@Component({
  selector: 'app-recenttrans',
  templateUrl: './recenttrans.component.html',
  styleUrls: ['./recenttrans.component.css']
})
export class RecenttransComponent implements OnInit {

  LineDataXvalue: Array<string> = [];
  LineDataSource: Array<number> = [];
  DataChartList: TypeChartDataList[] = [];
  chartOption!: EChartsOption;

  displayedTransColumns: string[] = ['Sno','ImgCount', 'Trans_Date', 'Series_Name','Party_Name','Borrower_Name','Bank_Name','Amount','Weight'];

  dataSourceTrans!: MatTableDataSource<TypeTransactions>; 
  @ViewChild(MatPaginator) paginatorTrans!: MatPaginator;
  @ViewChild(MatSort) sortTrans!: MatSort;  

  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  TransList: any[] = [];

  ChartType: number = 0;
  ChartPeriod: number = 1;

  constructor(private transService: TransactionService, private globals: AppGlobalsService,  public dialog: MatDialog, private _snackBar: MatSnackBar) { 
    this.LoadTransactions();     
  }

  ngOnInit(): void {
    this.LoadChart();
  }


  LoadTransactions()
   { 
    this.loadingData = true;
     this.transService.getRecentTransactions().subscribe((data:any ) =>  {             
       if (data === 0)
       {
         this.dataError  = true;
         this.errDetails = data; 
       }
       else{                      
          this.TransList = data;                  
          console.log(this.TransList);
                  
          // this.LoadTransactionsntoMatGrid();          
       }              
     });    
     this.loadingData = false;
   }

  //  LoadTransactionsntoMatGrid() 
  //  {      
  //     this.dataSourceTrans = new MatTableDataSource<TypeTransactions> (this.TransList);         
  //     setTimeout(() => this.dataSourceTrans.paginator = this.paginatorTrans);
  //     setTimeout(() => this.dataSourceTrans.sort = this.sortTrans);
  //  }

  
OpenSlideshow(element: any)
{  
  let imgData = {"TransSno": element.TransSno, "Heading": element.Trans_No, "ImgDetails" :this.globals.date_To_String (this.globals.IntToDate(element.Trans_Date)) + ', ' + element.Party_Name + ', Bwr:' + element.Borrower_Name + ', ' + element.Bank_Name };
  
  const dialogRef = this.dialog.open(ImageCarouselComponent, 
    {
     data: imgData, 
    });
    
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {     
      
    }); 
}

LoadTransaction(Trans: any)
{ 
 this.transService.getTransactions(Trans.TransSno, 0).subscribe((data:any ) =>  {             
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
        const dialogRefPmt = this.dialog.open(PaymentComponent, 
          {
           data: {Pmt}, 
          });
          
          dialogRefPmt.disableClose = true;
    
          dialogRefPmt.afterClosed().subscribe(result => {     
            
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

  applyFilterTrans(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceTrans.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceTrans.paginator) {
      this.dataSourceTrans.paginator.firstPage();
    }
  }

  SetChartType($event:any){
    this.ChartType = $event.target.value;
    this.LoadChart();
  }

  SetChartPeriod($event:any){
    this.ChartPeriod = $event.target.value;
    this.LoadChart();
  }

  LoadChart(){    
    // let trans = new ClsTransactions(this.dataService);
    // trans.getSummedMonthlyLoanAmount( this.ChartPeriod == 0 ? 3 : this.ChartPeriod == 1 ? 6 : 12 ).subscribe(data=>{
    //   this.DataChartList = JSON.parse(data.apiData);
    //   this.LineDataXvalue = [];
    //   this.LineDataSource = [];

    //   this.DataChartList.forEach(dt => {        
    //     this.LineDataXvalue.push(this.globals.GetMonthName(dt.Month,true));          
    //     this.LineDataSource.push(dt.Amount);  
    //     this.chartOption = {
   
    //       xAxis: {        
    //         type: 'category',
    //         data: this.LineDataXvalue,
    //       },
    //       yAxis: {
    //         type: 'value',
    //       },
    //       series: [
    //         {
    //           data: this.LineDataSource,
    //           type: this.ChartType == 0 ? 'line' : 'bar',          
    //           color: 'orange',          
    //         },
    //       ],
    //     };
    //   });      
      
    // })
  }
}
