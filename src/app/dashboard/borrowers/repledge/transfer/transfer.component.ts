
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
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {

  TransferForm!: FormGroup;  
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];

  filteredToBanks!: Observable<TypeBanks[]>;   
  tobanks: TypeBanks[] = [ ];
  
  
/*-------------------------------*/

/*Element Refs for Focus */
  @ViewChild('transdate') transdate!: ElementRef;
  @ViewChild('cramount') cramount!: ElementRef;  
  @ViewChild('intamount') intamount!: ElementRef;  
  @ViewChild('bank') bank!: ElementRef;
  @ViewChild('remarks') remarks!: ElementRef;
   
/*-------------------------------*/
  constructor(
    private bcastService: BroadcastserviceService,
    private globals: AppGlobalsService, 
    public dialogRef: MatDialogRef<TransferComponent>,
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

  displaytoBank(bnk: TypeBanks): string {
    return bnk && bnk.Bank_Name ? bnk.Bank_Name : '';
  }
  
  private _filtertoBank(value: string): TypeBanks[] {
    const filterValue = value.toLowerCase();    
    return this.tobanks.filter(bnk => bnk.Bank_Name.toLowerCase().includes(filterValue));                
  }
  
  LoadBanks()
  {    
    this.bnkService.getBanks(0,1).subscribe((data:any )  =>   {        

      this.filteredBanks = this.TransferForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  LoadToBanks()
  {    
    this.bnkService.getBanks(0,2).subscribe((data:any )  =>   {        

      this.filteredToBanks = this.TransferForm.controls['ToBank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filtertoBank(bnk) : this.tobanks.slice())), 
      );   
      this.tobanks     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewTransfer();
    this.LoadTransfer(this.data.Trf);
  }

  onNoClick(): void {
    this.dialogRef.close(); 
  }

  AddNewTransfer()
  { 
    this.TransferForm = this.formBuilder.group
    ({
      TransSno        : [0, [Validators.required]],    
      Trans_No        : ["AUTO", [Validators.required]],    
      Trans_Date      : [new Date, [Validators.required]],
      Ref_No          : [""],
      Series          : [{SeriesSno:this.globals.VtypTransfer, Series_Name:"Transfer"}],
      Party           : [{PartySno:this.data.Trf.PartySno, Party_Name:this.data.Trf.Party_Name}],
      Borrower        : [{BorrowerSno:this.data.Trf.BorrowerSno, Borrower_Name:this.data.Trf.Borrower_Name}],
      Bank            : [this.formBuilder.group( this.banks), [Validators.required]],
      ToBank          : [this.formBuilder.group( this.tobanks), [Validators.required]],
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

  LoadTransfer(Trf: TypeTransactions)
  { 
    console.log(Trf);
    console.log (Trf.TransSno);
    this.TransferForm.controls['TransSno'].setValue(Trf.TransSno);    
    this.TransferForm.controls['Trans_No'].setValue(Trf.Trans_No);    
    if (Trf.TransSno == 0)
    {
      this.TransferForm.controls['Trans_Date'].setValue( Trf.Trans_Date);          
    }    
    else
    {
      this.TransferForm.controls['Trans_Date'].setValue( this.globals.IntToDate (Trf.Trans_Date));    
    }      
    this.TransferForm.controls['Ref_No'].setValue(Trf.Ref_No);        
    this.TransferForm.controls['Series'].setValue({SeriesSno: Trf.Series.SeriesSno, Series_Name: Trf.Series.Series_Name } );    
    this.TransferForm.controls['Accout'].setValue({AccountSno: Trf.Account.AccountSno } );    
    this.TransferForm.controls['Borrower'].setValue({BorrowerSno: Trf.Borrower.BorrowerSno, Borrower_Name: Trf.Borrower.Borrower_Name });        
    this.TransferForm.controls['Bank'].patchValue({BankSno:Trf.Bank.BankSno, Bank_Name: Trf.Bank.Bank_Name});        
    this.TransferForm.controls['BankBranch'].patchValue({BranchSno:Trf.BankBranch.BranchSno, Branch_Name: Trf.BankBranch.Branch_Name});        
    this.TransferForm.controls['Loan_Type'].setValue(Trf.Loan_Type);        
    this.TransferForm.controls['Roi'].setValue(Trf.Roi);        
    this.TransferForm.controls['DrAmount'].setValue(Trf.DrAmount);        
    this.TransferForm.controls['CrAmount'].setValue(Trf.CrAmount);   
    this.TransferForm.controls['IntAmount'].setValue(Trf.IntAmount);   
    this.TransferForm.controls['Other_Charges'].setValue(Trf.Other_Charges);        
    this.TransferForm.controls['Ref'].patchValue({RefSno:Trf.Ref.RefSno, Ref_No: Trf.Ref.Ref_No});        
    this.TransferForm.controls['Remarks'].setValue(Trf.Remarks);               
    this.TransferForm.controls['fileSource'].patchValue([]);  
  }
  
  SaveTransfer(){          
    
    if (!this.TransferForm.controls['Bank'].value.BankSno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
      dialogRef.disableClose = true;
      //alert ("Select the Bank Account Branch");
      return;
    }

    console.log (this.TransferForm.value);
    if(this.TransferForm.valid){
      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
        dialogRef.disableClose = true;
        
        var ToBankSno: number = this.TransferForm.controls['ToBank'].value.BankSno;

      this.TransService.saveTransfer (Object(this.TransferForm.value),ToBankSno).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:            
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);            
            this._snackBar.open('Transfer created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
 
  DeleteTransfer(){         
    if (this.TransferForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Transfer is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Transfer?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.TransferForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Transfer Deleted successfully"},
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
