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
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {

  ReceiptForm!: FormGroup;  
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];

  Account_No: string = "";
  TransImages: FileHandle[] = [];
  imagesCount: number = 0;

  AmountInWords: string = "";
  IntAmountInWords: string = "";

  CloseAccount: boolean = false;
  /* Ng Models */
  GrossWt: number = 0;
  NettWt: number = 0;
  Purity: number = 91.6;
  N916GrossWt: number = 0;
  N916NettWt: number = 0;
  N916Purity: number = 75;
/*-------------------------------*/

/*Element Refs for Focus */
  @ViewChild('transdate') transdate!: ElementRef;
  @ViewChild('cramount') cramount!: ElementRef;  
  @ViewChild('intamount') intamount!: ElementRef;  
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
    public dialogRef: MatDialogRef<ReceiptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private formBuilder:FormBuilder, 
    private TransService:TransactionService,
    private bnkService: BankService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,    
  ) {

  }

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

      this.filteredBanks = this.ReceiptForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewReceipt();
    this.LoadReceipt(this.data.Rcpt);
    this.Account_No = this.data.Rcpt.Account.Account_No;
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
        console.log (result);
        this.TransImages = result;        
        this.imagesCount = result.length;   
      }); 
  }

   
  AddNewReceipt()
  { 
    this.ReceiptForm = this.formBuilder.group
    ({
      TransSno        : [0, [Validators.required]],    
      Trans_No        : ["AUTO", [Validators.required]],    
      Trans_Date      : [new Date, [Validators.required]],
      Ref_No          : [""],
      Series          : [{SeriesSno:this.globals.VTypReceipt, Series_Name:"Receipt"}],
      RParty          : [{PartySno:0, Party_Name:""}],
      Account         : [{AccountSno:this.data.Rcpt.Account.AccountSno}],
      Account_No      : [""],
      Borrower        : [{BorrowerSno:0, Borrower_Name:""}],
      Bank            : [this.formBuilder.group( this.banks), [Validators.required]],
      BankBranch      : [{BranchSno:0, Branch_Name:""} ],
      Loan_Type       : [0, ],    
      Roi             : [0, ],    
      Tenure          : [0, ],   
      DrAmount        : [0, ],    
      CrAmount        : [0, ],    
      PrincipalAmount : [0, ],    
      IntAmount       : [0, ],    
      Other_Charges   : [0, ],    
      Ref             : [{RefSno:0, Ref_No:""} ],    
      Remarks         : ["" ],    
      fileSource      : [this.TransImages],   
      CloseAccount    : [this.CloseAccount],   
    });    
    
  } 

  LoadReceipt(Rcpt: TypeTransactions)
  { 
    this.ReceiptForm.controls['TransSno'].setValue(Rcpt.TransSno);    
    this.ReceiptForm.controls['Trans_No'].setValue(Rcpt.Trans_No);    
    this.ReceiptForm.controls['Trans_Date'].setValue(Rcpt.Trans_Date);    
    this.ReceiptForm.controls['Ref_No'].setValue(Rcpt.Ref_No);        
    this.ReceiptForm.controls['Series'].setValue({SeriesSno: Rcpt.Series.SeriesSno, Series_Name: Rcpt.Series.Series_Name } );    
    this.ReceiptForm.controls['Account'].setValue({AccountSno: Rcpt.Account.AccountSno} );    
    this.ReceiptForm.controls['Borrower'].setValue({BorrowerSno: Rcpt.Borrower.BorrowerSno, Borrower_Name: Rcpt.Borrower.Borrower_Name });        
    this.ReceiptForm.controls['Bank'].patchValue({BankSno:Rcpt.Bank.BankSno, Bank_Name: Rcpt.Bank.Bank_Name});        
    this.ReceiptForm.controls['BankBranch'].patchValue({BranchSno:Rcpt.BankBranch.BranchSno, Branch_Name: Rcpt.BankBranch.Branch_Name});        
    this.ReceiptForm.controls['Loan_Type'].setValue(Rcpt.Loan_Type);        
    this.ReceiptForm.controls['Roi'].setValue(Rcpt.Roi);        
    this.ReceiptForm.controls['DrAmount'].setValue(Rcpt.DrAmount);        
    this.ReceiptForm.controls['CrAmount'].setValue(Rcpt.CrAmount);   
    this.ReceiptForm.controls['PrincipalAmount'].setValue(Rcpt.PrincipalAmount);  
    this.ReceiptForm.controls['IntAmount'].setValue(Rcpt.IntAmount);   
    this.ReceiptForm.controls['Other_Charges'].setValue(Rcpt.Other_Charges);        
    this.ReceiptForm.controls['Ref'].patchValue({RefSno:Rcpt.Ref.RefSno, Ref_No: Rcpt.Ref.Ref_No});        
    this.ReceiptForm.controls['Remarks'].setValue(Rcpt.Remarks);       
    this.ReceiptForm.controls['CloseAccount'].setValue(Rcpt.CloseAccount);      
    this.CloseAccount = Rcpt.CloseAccount ==1 ? true : false; 
    this.GrossWt = Rcpt.GrossWt;
    this.NettWt = Rcpt.NettWt;
    this.Purity = Rcpt.Purity;
    this.N916GrossWt = Rcpt.N916GrossWt;
    this.N916NettWt = Rcpt.N916NettWt; 
    this.N916Purity = Rcpt.N916Purity; 
    
    this.TransService.getTransaction_Images(Rcpt.TransSno, ).subscribe((data:any ) =>  {               
      this.TransImages = data;
      this.ReceiptForm.controls['fileSource'].patchValue(data);  
      this.imagesCount = this.TransImages.length;
    });
    

  }
  
  SaveReceipt(){          
    
    if ((this.ReceiptForm.controls['PrincipalAmount'].value > 0) || (this.ReceiptForm.controls['IntAmount'].value > 0))
    {
      if (!this.ReceiptForm.controls['Bank'].value.BankSno)
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

    this.ReceiptForm.controls['CrAmount'].setValue(this.ReceiptForm.controls['PrincipalAmount'].value + this.ReceiptForm.controls['IntAmount'].value);

    var StrItemXml: string = "";

    StrItemXml = "<ROOT>"
    StrItemXml += "<Transaction>"
      
    StrItemXml += "<Transaction_Details ";
    StrItemXml += " GrossWt='" + this.GrossWt + "' ";                 
    StrItemXml += " NettWt='" + this.NettWt + "' ";         
    StrItemXml += " Purity='" + this.Purity + "' ";     
    StrItemXml += " IteRemarks='' ";     
    StrItemXml += " >";
    StrItemXml += "</Transaction_Details>";

    StrItemXml += "<Transaction_Details ";
    StrItemXml += " GrossWt='" + this.N916GrossWt + "' ";                 
    StrItemXml += " NettWt='" + this.N916NettWt + "' ";         
    StrItemXml += " Purity='" + this.N916Purity + "' ";     
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

    this.ReceiptForm.controls['CloseAccount'].setValue(this.CloseAccount ? 1 : 0);    

    if(this.ReceiptForm.valid){

    //   if (isNaN(this.ReceiptForm.controls['CrAmount'].value))
    //   {
    //     this.ReceiptForm.controls['CrAmount'].setValue (0);      
    //   }
    
    // this.ReceiptForm.controls['CrAmount'].setValue(this.ReceiptForm.controls['CrAmount'].value + this.ReceiptForm.controls['IntAmount'].value);

      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
        dialogRef.disableClose = true;

        
      
      this.TransService.saveTransaction (Object(this.ReceiptForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:            
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);            
            this._snackBar.open('Receipt created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
 
  DeleteReceipt(){         
    if (this.ReceiptForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Receipt is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Receipt?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.ReceiptForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Receipt Deleted successfully"},
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
      this._snackBar.open('Error!! Nett Wt cannot be greater than Gross Wt', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
      this.NettWt = 0;
      return;
    }

  if (this.N916NettWt > this.N916GrossWt)
    {      
      this._snackBar.open('Error!! Nett Wt cannot be greater than Gross Wt', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
      this.N916NettWt = 0;
      return;
    }

  if (this.N916Purity > 100)
    {      
      this._snackBar.open('Error!! Purity cannot be greater than 100', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });            
      this.N916Purity = 75;
      return;
    }

    if (event.key != "Enter") return;    
    setTimeout(()=>{  
      
      switch (event.srcElement.name) {
        case "transdate":
          this.cramount.nativeElement.focus();   
          break;
        case "principalamount":
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
          
          this.intamount.nativeElement.focus();   
          break;        
        case "intamount":
          const inttoWords = new ToWords({
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
  
          this.IntAmountInWords = inttoWords.convert(event.target.value);

            this.bank.nativeElement.focus();   
            break;        
        case "remarks":
          this.grosswt.nativeElement.focus();   
          break;
        case "grosswt":
          this.nettwt.nativeElement.focus();   
          break;
        case "nettwt":
          this.ngrosswt.nativeElement.focus();   
          break;
        case "ngrosswt":
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
