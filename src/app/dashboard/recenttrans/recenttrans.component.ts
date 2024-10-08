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

@Component({
  selector: 'app-recenttrans',
  templateUrl: './recenttrans.component.html',
  styleUrls: ['./recenttrans.component.css']
})
export class RecenttransComponent implements OnInit {

  displayedTransColumns: string[] = ['Sno','ImgCount', 'Trans_Date', 'Series_Name','Party_Name','Borrower_Name','Bank_Name','Amount','Weight'];

  dataSourceTrans!: MatTableDataSource<TypeTransactions>; 
  @ViewChild(MatPaginator) paginatorTrans!: MatPaginator;
  @ViewChild(MatSort) sortTrans!: MatSort;  

  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  TransList: any[] = [];

  constructor(private transService: TransactionService, private globals: AppGlobalsService,  public dialog: MatDialog, private _snackBar: MatSnackBar) { 
    this.LoadTransactions();     
  }

  ngOnInit(): void {
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
}
