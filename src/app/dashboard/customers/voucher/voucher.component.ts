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
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css']
})
export class VoucherComponent implements OnInit {

  VoucherForm!: FormGroup;  
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];
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
    public dialogRef: MatDialogRef<VoucherComponent>,
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

      this.filteredBanks = this.VoucherForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewVoucher();        
    this.LoadVoucher(this.data.Vou);    
    this.Account_No = this.data.Vou.Account.Account_No;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  
  AddNewVoucher()
  {     
    this.VoucherForm = this.formBuilder.group
    ({
      TransSno        : [0, [Validators.required]],    
      Trans_No        : ["AUTO", [Validators.required]],    
      Trans_Date      : [new Date, [Validators.required]],
      Ref_No          : [""],
      Series          : [{SeriesSno:this.globals.VtypVoucher, Series_Name:"Voucher"}],
      // Party           : [{PartySno:this.data.Vou.Party.PartySno, Party_Name:this.data.Vou.Party.Party_Name}],
      Account         : [{AccountSno:this.data.Vou.Account.AccountSno}],
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
      fileSource      : [],   
      CloseAccount    : [false],   
    });        
  }
 
  LoadVoucher(Vou: TypeTransactions)
  { 
    this.VoucherForm.controls['TransSno'].setValue(Vou.TransSno);    
    this.VoucherForm.controls['Trans_No'].setValue(Vou.Trans_No);    
    this.VoucherForm.controls['Trans_Date'].setValue(Vou.Trans_Date);    
    this.VoucherForm.controls['Ref_No'].setValue(Vou.Ref_No);        
    this.VoucherForm.controls['Series'].setValue({SeriesSno: Vou.Series.SeriesSno, Series_Name: Vou.Series.Series_Name } );    
    this.VoucherForm.controls['Account'].setValue({AccountSno: Vou.Account.AccountSno} );    
    this.VoucherForm.controls['Borrower'].setValue({BorrowerSno: Vou.Borrower.BorrowerSno, Borrower_Name: Vou.Borrower.Borrower_Name });        
    this.VoucherForm.controls['Bank'].patchValue({BankSno:Vou.Bank.BankSno, Bank_Name: Vou.Bank.Bank_Name});        
    this.VoucherForm.controls['BankBranch'].patchValue({BranchSno:Vou.BankBranch.BranchSno, Branch_Name: Vou.BankBranch.Branch_Name});  
    this.VoucherForm.controls['Loan_Type'].setValue(Vou.Loan_Type);        
    this.VoucherForm.controls['Roi'].setValue(Vou.Roi);        
    this.VoucherForm.controls['DrAmount'].setValue(Vou.DrAmount);        
    this.VoucherForm.controls['CrAmount'].setValue(Vou.CrAmount);        
    this.VoucherForm.controls['Other_Charges'].setValue(Vou.Other_Charges);        
    this.VoucherForm.controls['Ref'].patchValue({RefSno:Vou.Ref.RefSno, Ref_No: Vou.Ref.Ref_No});        
    this.VoucherForm.controls['Remarks'].setValue(Vou.Remarks);      
    this.VoucherForm.controls['CloseAccount'].setValue(Vou.CloseAccount);    
  }
  
  SaveVoucher(){          
    
    if (!this.VoucherForm.controls['Bank'].value.BankSno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
      dialogRef.disableClose = true;
      //alert ("Select the Bank Account Branch");
      return;
    }

    var StrItemXml: string = "";

    StrItemXml = "<ROOT>"
    StrItemXml += "<Transaction>"
      

    StrItemXml += "</Transaction>"
    StrItemXml += "</ROOT>"

    var StrImageXml: string = "";

    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"
    
    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>"

    if(this.VoucherForm.valid){
      
      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
      dialogRef.disableClose = true;

      this.TransService.saveTransaction (Object(this.VoucherForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {
        
        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);
            this._snackBar.open('Voucher created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
 
  DeleteVoucher(){         
    if (this.VoucherForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Voucher is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Voucher?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.VoucherForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Voucher Deleted successfully"},
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
          this.dramount.nativeElement.focus();   
          break;
        case "dramount":
          this.roi.nativeElement.focus();   
          break;
        case "roi":
          this.bank.nativeElement.focus();   
          break;
        case "remarks":
          this.grosswt.nativeElement.focus();   
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
