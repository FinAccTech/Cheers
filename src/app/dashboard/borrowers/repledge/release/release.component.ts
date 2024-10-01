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
import { TypeRepledges } from 'src/app/dashboard/types/TypeRepledges';


@Component({
  selector: 'app-release',
  templateUrl: './release.component.html',
  styleUrls: ['./release.component.css']
})
export class ReleaseComponent implements OnInit {

  ReleaseForm!: FormGroup;  
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

RpAmount: number = 0;

/*Element Refs for Focus */
  @ViewChild('transdate') transdate!: ElementRef;
  @ViewChild('dramount') dramount!: ElementRef;  
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
    public dialogRef: MatDialogRef<ReleaseComponent>,
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

      this.filteredBanks = this.ReleaseForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewRelease();
    this.LoadRelease(this.data.Rel);
  }

  onNoClick(): void {
    this.dialogRef.close(); 
  }

  AddNewRelease()
  { 
    this.ReleaseForm = this.formBuilder.group
    ({
      TransSno        : [0, [Validators.required]],    
      Trans_No        : ["AUTO", [Validators.required]],    
      Trans_Date      : [new Date, [Validators.required]],
      Ref_No          : [""],
      Series          : [{SeriesSno:this.globals.VtypRelease, Series_Name:"Release"}],
      Party           : [{PartySno:this.data.Rel.PartySno, Party_Name:this.data.Rel.Party_Name}],
      Borrower        : [{BorrowerSno:this.data.Rel.BorrowerSno, Borrower_Name:this.data.Rel.Borrower_Name}],
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

  LoadRelease(Rel: TypeTransactions)
  { 
    this.ReleaseForm.controls['TransSno'].setValue(Rel.TransSno);    
    this.ReleaseForm.controls['Trans_No'].setValue(Rel.Trans_No);    
    if (Rel.TransSno == 0)
    {
      this.ReleaseForm.controls['Trans_Date'].setValue( Rel.Trans_Date);          
    }    
    else 
    {
      this.ReleaseForm.controls['Trans_Date'].setValue( this.globals.IntToDate (Rel.Trans_Date));    
    }      
    this.ReleaseForm.controls['Ref_No'].setValue(Rel.Ref_No);        
    this.ReleaseForm.controls['Series'].setValue({SeriesSno: Rel.Series.SeriesSno, Series_Name: Rel.Series.Series_Name } );    
    this.ReleaseForm.controls['Party'].setValue({PartySno: Rel.Party.PartySno, Party_Name: Rel.Party.Party_Name } );    
    this.ReleaseForm.controls['Borrower'].setValue({BorrowerSno: Rel.Borrower.BorrowerSno, Borrower_Name: Rel.Borrower.Borrower_Name });        
    this.ReleaseForm.controls['Bank'].patchValue({BankSno:Rel.Bank.BankSno, Bank_Name: Rel.Bank.Bank_Name});        
    this.ReleaseForm.controls['BankBranch'].patchValue({BranchSno:Rel.BankBranch.BranchSno, Branch_Name: Rel.BankBranch.Branch_Name});        
    this.ReleaseForm.controls['Loan_Type'].setValue(Rel.Loan_Type);        
    this.ReleaseForm.controls['Roi'].setValue(Rel.Roi);        
    this.ReleaseForm.controls['DrAmount'].setValue(Rel.DrAmount);    
    this.RpAmount = Rel.DrAmount;
    this.ReleaseForm.controls['CrAmount'].setValue(Rel.CrAmount);   
    this.ReleaseForm.controls['IntAmount'].setValue(Rel.IntAmount);       
    this.ReleaseForm.controls['Other_Charges'].setValue(Rel.Other_Charges);        
    this.ReleaseForm.controls['Ref'].patchValue({RefSno:Rel.Ref.RefSno, Ref_No: Rel.Ref.Ref_No});        
    this.ReleaseForm.controls['Remarks'].setValue(Rel.Remarks);               
    this.ReleaseForm.controls['fileSource'].patchValue([]);  
  }
  
  SaveRelease(){          
    
    if (!this.ReleaseForm.controls['Bank'].value.BankSno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
      dialogRef.disableClose = true;
      //alert ("Select the Bank Account Branch");
      return;
    }

    console.log (this.ReleaseForm.value);
    if(this.ReleaseForm.valid){
      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
        dialogRef.disableClose = true;

        var StrItemXml = "<ROOT><Transaction> </Transaction></ROOT>";
        var StrImageXml = "<ROOT><Images> </Images></ROOT>";
        

      this.TransService.saveTransaction (Object(this.ReleaseForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:            
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);            
            this._snackBar.open('Release created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
 
  DeleteRelease(){         
    if (this.ReleaseForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Release is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Release?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.ReleaseForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Release Deleted successfully"},
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
          this.dramount.nativeElement.focus();   
          break;
        case "dramount":
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
  if (event.srcElement.name == "dramount")
  {    
    this.intamount.nativeElement.value = (this.dramount.nativeElement.value - this.RpAmount);
  }

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
