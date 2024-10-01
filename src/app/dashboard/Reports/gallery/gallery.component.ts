import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { MatTableDataSource } from '@angular/material/table';
import { TypeTransactions } from '../../types/TypeTransactions';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TypeRepledges } from '../../types/TypeRepledges';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from '../../transaction.service';
import { FileHandle } from '../../types/file-handle';
import { ImagePreviewComponent } from '../../image-preview/image-preview.component';
import { TypeImagePreview } from '../../types/TypeImagePreview';
import { AppGlobalsService } from '../../app-globals.service';
import { PaymentComponent } from '../../customers/payment/payment.component';
import { ReceiptComponent } from '../../customers/receipt/receipt.component';
import { RepledgeComponent } from '../../borrowers/repledge/repledge.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  
  @Input()  PartySno!: number;
  @Input()  PartyType!: number;

  AllCustomers: boolean = true;
  FilterImageValue: number = 0;

  getScreenWidth: number = 0;
  getScreenHeight: number = 0;

  constructor(private PartyService: PartyService, private globals: AppGlobalsService, private dialog: MatDialog, private TransService: TransactionService) { }

  Customers: TypeParties[] =[];
  CustImages: any[] = [];
  RpImages: any[] = [];
 
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

    
  @HostListener('window:load', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;    
    console.log (this.getScreenWidth);
    console.log (this.getScreenHeight);
  }
  
  ngOnInit(): void {

    if (!this.PartySno)
    {
      this.PartySno = 0;
    }

    if (!this.PartyType)
    {
      this.PartyType = 0;
    }

    if (this.PartySno == 0)
    {
      this.AllCustomers = true;
      this.LoadCustomers();    
    }    
    else
    {
      this.AllCustomers = false;
      this.LoadImages(this.PartySno);
    }


  }

  LoadCustomers()
  {    
    this.PartyService.getParties(0,1).subscribe((data:any )  =>   {     
      this.Customers     = (data);  
    });        
  }

  LoadImages(PartySno: number) 
  {    
   const dialogRef = this.dialog.open(MsgboxComponent, 
     {
       data: { "DialogType": 0}} 
     );
     dialogRef.disableClose = true;

    this.TransService.getImagesList(PartySno, this.PartyType).subscribe((data:any ) =>  {      
      console.log (data)       ;
      this.loadingData = false;       
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
        dialogRef.close();
      }
      else{                 
       this.CustImages = JSON.parse (data.apiData);            
       this.RpImages = JSON.parse (data.apiData);            
       this.CustImages = this.CustImages.filter(obj => obj.SeriesSno != 3);
       this.RpImages = this.RpImages.filter(obj => obj.SeriesSno == 3);
       
       dialogRef.close();           
      }      
    });    
    this.loadingData = false;
  }

  OpenPreview(Img: TypeImagePreview)
  {
    const dialogRef = this.dialog.open(ImagePreviewComponent, 
      {
       data: Img,
      //  width: this.getScreenWidth+'px',   // Set width to 600px
      //  height: this.getScreenHeight+'px',  // Set height to 530px

      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
  }

  LoadTransaction(Img: TypeImagePreview)
  {

    if (!Img.TransSno) { return; }
    if (Img.TransSno == 0 ) { return; }

   this.TransService.getTransactions(Img.TransSno, 0).subscribe((data:any ) =>  {             
     this.loadingData = false;
     
     if (data === 0)
     {        
       alert  (data);
       return;
     }
     else{                         
      data[0].Trans_Date = this.globals.IntToDate(data[0].Trans_Date);    
      switch (Img.SeriesSno) {
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

       case this.globals.VtypRepledge:
             var Rp: TypeTransactions;
             Rp = data[0];           
             const dialogRefVou = this.dialog.open(RepledgeComponent, 
               {
                data: {Rp},
               });
               
               dialogRefVou.disableClose = true;
         
               dialogRefVou.afterClosed().subscribe(result => {     
                 
               }); 
             break;
      }
     }      
   });    
}
FilterImage($event: any)
{  
  this.FilterImageValue = $event.value;
}
}
