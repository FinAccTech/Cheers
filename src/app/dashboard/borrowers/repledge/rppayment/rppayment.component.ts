  import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
  import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
  import { FormBuilder,FormGroup, Validators } from '@angular/forms';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { Observable, map, startWith } from 'rxjs';
  import { TypeBanks } from 'src/app/dashboard/types/TypeBanks';
  import { BroadcastserviceService } from 'src/app/dashboard/broadcast.service';
  import { AppGlobalsService } from 'src/app/dashboard/app-globals.service';
  import { TransactionService } from 'src/app/dashboard/transaction.service';
  import { BankService } from 'src/app/dashboard/banks/bank.service';
  import { TypeTransactions } from 'src/app/dashboard/types/TypeTransactions';
  import { MsgboxComponent } from 'src/app/dashboard/msgbox/msgbox.component';
  
  
  @Component({
    selector: 'app-rppayment',
    templateUrl: './rppayment.component.html',
    styleUrls: ['./rppayment.component.css']
  })
  export class RppaymentComponent implements OnInit {
  
    RpPaymentForm!: FormGroup;  
    filteredBanks!: Observable<TypeBanks[]>;   
    banks: TypeBanks[] = [ ];
    
    imagesCount: number = 0;
  
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
      public dialogRef: MatDialogRef<RppaymentComponent>,
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
  
        this.filteredBanks = this.RpPaymentForm.controls['Bank'].valueChanges.pipe(
          startWith(null),
          map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
          map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
        );   
        this.banks     = (data);  
      });        
    }
  
    ngOnInit(): void {
      this.AddNewPayment();
      this.LoadPayment(this.data.Rpp);
    }
  
    onNoClick(): void {
      this.dialogRef.close(); 
    }
  
    AddNewPayment()
    { 
      this.RpPaymentForm = this.formBuilder.group
      ({
        TransSno        : [0, [Validators.required]],    
        Trans_No        : ["AUTO", [Validators.required]],    
        Trans_Date      : [new Date, [Validators.required]],
        Ref_No          : [""],
        Series          : [{SeriesSno:this.globals.VTypRpPayment, Series_Name:"RP Payment"}],
        RParty          : [{PartySno:0, Party_Name:""}],
        Party           : [{PartySno:this.data.Rpp.PartySno, Party_Name:this.data.Rpp.Party_Name}],
        Borrower        : [{BorrowerSno:this.data.Rpp.BorrowerSno, Borrower_Name:this.data.Rpp.Borrower_Name}],
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
        fileSource      : [],   
      });    
      
    } 
  
    LoadPayment(Rpp: TypeTransactions)
    {       
      this.RpPaymentForm.controls['TransSno'].setValue(Rpp.TransSno);    
      this.RpPaymentForm.controls['Trans_No'].setValue(Rpp.Trans_No);    
      this.RpPaymentForm.controls['Trans_Date'].setValue( Rpp.Trans_Date);    
      this.RpPaymentForm.controls['Ref_No'].setValue(Rpp.Ref_No);        
      this.RpPaymentForm.controls['Series'].setValue({SeriesSno: Rpp.Series.SeriesSno, Series_Name: Rpp.Series.Series_Name } );    
      this.RpPaymentForm.controls['Account'].setValue({AccountSno: Rpp.Account.AccountSno } );    
      this.RpPaymentForm.controls['Borrower'].setValue({BorrowerSno: Rpp.Borrower.BorrowerSno, Borrower_Name: Rpp.Borrower.Borrower_Name });        
      this.RpPaymentForm.controls['Bank'].patchValue({BankSno:Rpp.Bank.BankSno, Bank_Name: Rpp.Bank.Bank_Name});        
      this.RpPaymentForm.controls['BankBranch'].patchValue({BranchSno:Rpp.BankBranch.BranchSno, Branch_Name: Rpp.BankBranch.Branch_Name});        
      this.RpPaymentForm.controls['Loan_Type'].setValue(Rpp.Loan_Type);        
      this.RpPaymentForm.controls['Roi'].setValue(Rpp.Roi);        
      this.RpPaymentForm.controls['DrAmount'].setValue(Rpp.DrAmount);        
      this.RpPaymentForm.controls['CrAmount'].setValue(Rpp.CrAmount);   
      this.RpPaymentForm.controls['IntAmount'].setValue(Rpp.IntAmount);   
      this.RpPaymentForm.controls['Other_Charges'].setValue(Rpp.Other_Charges);        
      this.RpPaymentForm.controls['Ref'].patchValue({RefSno:Rpp.Ref.RefSno, Ref_No: Rpp.Ref.Ref_No});        
      this.RpPaymentForm.controls['Remarks'].setValue(Rpp.Remarks);               
      this.RpPaymentForm.controls['fileSource'].patchValue([]);  
    }
    
    SavePayment(){          
      
      if (!this.RpPaymentForm.controls['Bank'].value.BankSno)
      {
        const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
        dialogRef.disableClose = true;
        //alert ("Select the Bank Account Branch");
        return;
      }
  
      console.log (this.RpPaymentForm.value);
      if(this.RpPaymentForm.valid){
        const dialogRef = this.dialog.open(MsgboxComponent, 
          {
            data: { "DialogType": 0}}
          );
          dialogRef.disableClose = true;
  
          var StrItemXml = "<ROOT><Transaction> </Transaction></ROOT>";
          var StrImageXml = "<ROOT><Images> </Images></ROOT>";
          
  
        this.TransService.saveTransaction (Object(this.RpPaymentForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {
  
          switch (data.queryStatus) {
            case 0:            
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
      if (this.RpPaymentForm.controls['TransSno'].value == 0)
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
              this.TransService.deleteTransaction(Object(this.RpPaymentForm.value)).subscribe((data:any ) => {        
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
          case "cramount":
            this.intamount.nativeElement.focus();   
            break;        
          case "intamount":
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
  