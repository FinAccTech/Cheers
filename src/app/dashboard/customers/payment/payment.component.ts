import { NgZone} from '@angular/core'
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { BankService } from '../../banks/bank.service';
import { TypeTransactions } from '../../types/TypeTransactions';
import { TransactionService } from '../../transaction.service';
import { BroadcastserviceService } from '../../broadcast.service';
import { ImagesComponent } from '../../images/images.component';
import { AppGlobalsService } from '../../app-globals.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { TypeBanks } from '../../types/TypeBanks';
import { FileHandle } from '../../types/file-handle';
import { ToWords } from 'to-words';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {

  PaymentForm!: FormGroup;  
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];
  
  TransImages: FileHandle[] = [];
  imagesCount: number = 0;

  AmountInWords: string = "";
  /* Ng Models */
  GrossWt: number = 0;
  NettWt: number = 0;
  Purity: number = 91.6;
  N916GrossWt: number = 0;
  N916NettWt: number = 0;
  N916Purity: number = 75;
/*-------------------------------*/

  Account_No: string = "";

/*Element Refs for Focus */
  @ViewChild('transdate') transdate!: ElementRef;
  @ViewChild('dramount') dramount!: ElementRef;
  @ViewChild('roi') roi!: ElementRef;
  @ViewChild('bank') bank!: ElementRef;
  @ViewChild('remarks') remarks!: ElementRef;
  @ViewChild('grosswt') grosswt!: ElementRef;
  @ViewChild('nettwt') nettwt!: ElementRef;
  @ViewChild('purity') purity!: ElementRef;
  @ViewChild('ngrosswt') ngrosswt!: ElementRef;
  @ViewChild('nnettwt') nnettwt!: ElementRef;
  @ViewChild('npurity') npurity!: ElementRef;
  
/*-------------------------------*/
  constructor(    
    private bcastService: BroadcastserviceService, 
    private globals: AppGlobalsService,
    public dialogRef: MatDialogRef<PaymentComponent>,
    private zone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder,     
    private bnkService: BankService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private TransService: TransactionService

  ) {}

  displayBank(bnk: TypeBanks): string {
    return bnk && bnk.Bank_Name ? bnk.Bank_Name : '';
  }
  
  private _filterBank(value: string): TypeBanks[] {
    const filterValue = value.toLowerCase();    
    return this.banks.filter(bnk => bnk.Bank_Name.toLowerCase().includes(filterValue));                
  }

  LoadBanks()
  {    
    this.bnkService.getBanks(0,1).subscribe((data:any )  =>   {        

      this.filteredBanks = this.PaymentForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewPayment();        
    this.LoadPayment(this.data.Pmt);    
    this.Account_No = this.data.Pmt.Account.Account_No;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  SetResponse(resp: string){
    //this.data.Response = resp;
  }

  OpenImagesCreation(){
    var img = this.TransImages;
    const dialogRef = this.dialog.open(ImagesComponent, 
      { 
        width: '1024px',
        height: '800px',
        data: {img},
      });
      
      dialogRef.disableClose = true;
      dialogRef.afterClosed().subscribe(result => {        
        this.TransImages = result;        
        this.imagesCount = result.length;   
      }); 
  }

  
  AddNewPayment()
  {     
    this.PaymentForm = this.formBuilder.group
    ({
      TransSno        : [ 0, [Validators.required]  ],    
      Trans_No        : [ "AUTO", [Validators.required] ],    
      Trans_Date      : [ new Date, [Validators.required] ],
      Ref_No          : [ "" ],
      Series          : [ {SeriesSno:this.globals.VtypPayment, Series_Name:"Payment"}],
      RParty          : [{PartySno:0, Party_Name:""}],
      Account         : [ "{AccountSno:this.data.Pmt.Account.AccountSno}"],
      Account_No      : [ "" ],
      Borrower        : [ {BorrowerSno:0, Borrower_Name:""}],
      Bank            : [ this.formBuilder.group( this.banks), [Validators.required]],      
      BankBranch      : [ {BranchSno:0, Branch_Name:""}],
      Loan_Type       : [ 0,],    
      Roi             : [ this.data.Pmt.Account.Roi,[Validators.required]],   
      Tenure          : [ 0,],    
      DrAmount        : [ 0,],    
      CrAmount        : [ 0,],    
      PrincipalAmount : [ 0,],    
      IntAmount       : [ 0,],    
      Other_Charges   : [ 0,],    
      Ref             : [ {RefSno:0, Ref_No:""}],    
      Remarks         : [ ""],   
      fileSource      : [ this.TransImages],   
      CloseAccount    : [ false],   
    });        
  }
 
  LoadPayment(Pmt: TypeTransactions)
  { 
    this.PaymentForm.controls['TransSno'].setValue(Pmt.TransSno);    
    this.PaymentForm.controls['Trans_No'].setValue(Pmt.Trans_No);    
    this.PaymentForm.controls['Trans_Date'].setValue(Pmt.Trans_Date);    
    this.PaymentForm.controls['Ref_No'].setValue(Pmt.Ref_No);        
    this.PaymentForm.controls['Series'].setValue({SeriesSno: Pmt.Series.SeriesSno, Series_Name: Pmt.Series.Series_Name } );    
    this.PaymentForm.controls['Account'].setValue({AccountSno: Pmt.Account.AccountSno} );    
    this.PaymentForm.controls['Borrower'].setValue({BorrowerSno: Pmt.Borrower.BorrowerSno, Borrower_Name: Pmt.Borrower.Borrower_Name });        
    this.PaymentForm.controls['Bank'].patchValue({BankSno:Pmt.Bank.BankSno, Bank_Name: Pmt.Bank.Bank_Name});        
    this.PaymentForm.controls['BankBranch'].patchValue({BranchSno:Pmt.BankBranch.BranchSno, Branch_Name: Pmt.BankBranch.Branch_Name});  
    this.PaymentForm.controls['Loan_Type'].setValue(Pmt.Loan_Type);        
    this.PaymentForm.controls['Roi'].setValue(Pmt.Roi);        
    this.PaymentForm.controls['DrAmount'].setValue(Pmt.DrAmount);        
    this.PaymentForm.controls['CrAmount'].setValue(Pmt.CrAmount);        
    this.PaymentForm.controls['Other_Charges'].setValue(Pmt.Other_Charges);        
    this.PaymentForm.controls['Ref'].patchValue({RefSno:Pmt.Ref.RefSno, Ref_No: Pmt.Ref.Ref_No});        
    this.PaymentForm.controls['Remarks'].setValue(Pmt.Remarks);    
    this.PaymentForm.controls['CloseAccount'].setValue(Pmt.CloseAccount);      
    this.GrossWt = Pmt.GrossWt;
    this.NettWt = Pmt.NettWt;
    this.Purity = Pmt.Purity;
    this.N916GrossWt = Pmt.N916GrossWt;
    this.N916NettWt = Pmt.N916NettWt;
    this.N916Purity = Pmt.N916Purity;

    this.TransService.getTransaction_Images(Pmt.TransSno, ).subscribe((data:any ) =>  {               
      this.TransImages = data;
      this.PaymentForm.controls['fileSource'].patchValue(data);  
      this.imagesCount = this.TransImages.length;
    });
  }
  
  SavePayment(){                  
    if (this.PaymentForm.controls['DrAmount'].value > 0 )
      {
        if (!this.PaymentForm.controls['Bank'].value.BankSno)
        {      
            const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
            dialogRef.disableClose = true;        
            return;
        }      
      }
      else
      {
        if (this.NettWt == 0 && this.N916NettWt == 0)
        {      
            const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Either enter Amount or weight details "} });
            dialogRef.disableClose = true;        
            return;
        }
      }

    var StrItemXml: string = "";

    StrItemXml = "<ROOT>"
    StrItemXml += "<Transaction>"
      
    StrItemXml += "<Transaction_Details ";
    StrItemXml += " GrossWt='" + (this.GrossWt === null ? 0 : this.GrossWt) + "' ";                 
    StrItemXml += " NettWt='" + (this.NettWt === null ? 0 : this.NettWt) + "' ";         
    StrItemXml += " Purity='" + (this.Purity === null ? 0 : this.Purity) + "' ";     
    StrItemXml += " IteRemarks='' ";     
    StrItemXml += " >";
    StrItemXml += "</Transaction_Details>";

    StrItemXml += "<Transaction_Details ";
    StrItemXml += " GrossWt='" + (this.N916GrossWt === null ? 0 : this.N916GrossWt) + "' ";                 
    StrItemXml += " NettWt='" + (this.N916NettWt === null ? 0 : this.N916NettWt) + "' ";         
    StrItemXml += " Purity='" + (this.N916Purity === null ? 0 : this.N916Purity) + "' ";     
    StrItemXml += " IteRemarks='' ";     
    StrItemXml += " >";
    StrItemXml += "</Transaction_Details>";

    StrItemXml += "</Transaction>"
    StrItemXml += "</ROOT>"

    var StrImageXml: string = "";

    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"
    
    for (var i=0; i < this.TransImages.length; i++)
    {
      if (this.TransImages[i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.TransImages[i].Image_Name + "' ";                 
        StrImageXml += " Image_Url='" + this.TransImages[i].Image_Name + "' ";             
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   

    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>"

    if(this.PaymentForm.valid){
      
      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
      dialogRef.disableClose = true;

      this.TransService.saveTransaction (Object(this.PaymentForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {
        
        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);
            this._snackBar.open('Payment created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
            dialogRef.close();
            this.dialogRef.close();
            break;
          default:
            alert ("Error!!!");
            dialogRef.close();
            break;
        }      
  
      });
    }
  }
 
  DeletePayment(){         
    if (this.PaymentForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Payment is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Payment?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.PaymentForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Payment Deleted successfully"},
                  });
                  this.bcastService.sendUpdate(true);   
                  dialogRef3.disableClose = true; 
                  this.dialogRef.close("Delete");
              }          
            });
          }          
        });  
    }    
  }

  MoveFocus(event: any)
  {     
    if (this.NettWt > this.GrossWt)
      {        
        this._snackBar.open('Error !! Nett Wt cannot be greater than Gross Wt', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
        this.NettWt = 0;
        return;
      }

    if (this.N916NettWt > this.N916GrossWt)
      {        
        this._snackBar.open('Error !! Nett Wt cannot be greater than Gross Wt', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
        this.N916NettWt = 0;
        return;
      }

    if (this.N916Purity > 100)
      {        
        this._snackBar.open('Error !! Purity cannot be greater than 100', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
        this.N916Purity = 75;
        return;
      }

    if (event.key != "Enter") return;    
    setTimeout(()=>{  
      
      switch (event.srcElement.name) {
        case "transdate":
          this.dramount.nativeElement.focus();   
          break;
        case "dramount":          
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
  
          this.AmountInWords = toWords.convert(event.target.value);
          this.roi.nativeElement.focus();   

          break;
        case "roi":
          this.bank.nativeElement.focus();   
          break;
        case "remarks":
          this.grosswt.nativeElement.focus();   
          break;
        case "grosswt":
          this.NettWt = this.GrossWt;
          this.nettwt.nativeElement.focus();   
          break;
        case "nettwt":          
          this.ngrosswt.nativeElement.focus();   
          break;
        case "ngrosswt":
          this.N916NettWt = this.N916GrossWt;
          this.nnettwt.nativeElement.focus();   
          break;
        default:
          break;
      } 
      // this.CalcAmount();
    })    
  }

  NullCheck(event: any, type: number)
  {
    if (type == 1)
    {
      if (event.target.value == 0 )
      {
        event.target.value = '';
      }
    }
    else
    {
      if (event.target.value == '' )
      {
        event.target.value = 0;
      }
    }
  }

}
