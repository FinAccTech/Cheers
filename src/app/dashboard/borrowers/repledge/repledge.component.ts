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
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { TypeBankBranches } from '../../types/TypeBankBranches';
import { ReleaseComponent } from './release/release.component';
import { RppaymentComponent } from './rppayment/rppayment.component';


interface LoanType {
  value : number;
  text: string;
}

@Component({
  selector: 'app-repledge',
  templateUrl: './repledge.component.html',
  styleUrls: ['./repledge.component.css']
})


export class RepledgeComponent implements OnInit {

  LoanTypes: LoanType[] = [
    {value: 1, text: "Term Loan"},
    {value: 2, text: "Overdraft"},
    {value: 3, text: "Others"}
  ];
  
  SelectedLoanType = this.LoanTypes[0].value;
  CurrentTransSno: number = 0;

  ReleaseDate: string = "";

  RepledgeForm!: FormGroup;  
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];
  
  filteredBranches!: Observable<TypeBankBranches[]>;   
  branches: TypeBankBranches[] = [ ];

  filteredParties!: Observable<TypeParties[]>;   
  parties: TypeParties[] = [ ];

  TransImages: FileHandle[] = [];
  imagesCount: number = 0;

  WeightBalance: number = 0;
  RepledgedWeight: number = 0;
  NonRepledgedWeight: number = 0;

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
  @ViewChild('refno') refno!: ElementRef;  
  @ViewChild('roi') roi!: ElementRef;
  @ViewChild('cramount') cramount!: ElementRef;  
  @ViewChild('bank') bank!: ElementRef;
  @ViewChild('branch') branch!: ElementRef;
  @ViewChild('party') party!: ElementRef;
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
    public dialogRef: MatDialogRef<RepledgeComponent>,
    private zone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder,     
    private bnkService: BankService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private TransService: TransactionService,
    private PartyService: PartyService,
  ) {}

  displayBank(bnk: TypeBanks): string {
    return bnk && bnk.Bank_Name ? bnk.Bank_Name : '';
  }
  
  private _filterBank(value: string): TypeBanks[] {
    const filterValue = value.toLowerCase();    
    return this.banks.filter(bnk => bnk.Bank_Name.toLowerCase().includes(filterValue));                
  }

  displayParty(pty: TypeParties): string {
    return pty && pty.Party_Name ? pty.Party_Name : '';
  }
  
  private _filterParty(value: string): TypeParties[] {
    const filterValue = value.toLowerCase();    
    return this.parties.filter(pty => pty.Party_Name.toLowerCase().includes(filterValue));                
  }

  displayBranch(brch: TypeBankBranches): string {
    return brch && brch.Branch_Name ? brch.Branch_Name : '';
  }
  
  private _filterBranch(value: string): TypeBankBranches[] {
    const filterValue = value.toLowerCase();    
    return this.branches.filter(brch => brch.Branch_Name.toLowerCase().includes(filterValue));                
  }


  LoadBanks()
  {    
    this.bnkService.getBanks(0,2).subscribe((data:any )  =>   {        

      this.RepledgeForm.controls['BankBranch'].patchValue({BranchSno:0, Branch_Name: ""});  
      this.filteredBanks = this.RepledgeForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk ),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });        
  }

  LoadBranches()
  { 
    var BankSno: number = this.RepledgeForm.controls['Bank'].value.BankSno; 
    if (BankSno == 0)
    {
        this._snackBar.open('Select the Bank before selecting Branch', 'Error',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                            
        return;
    }

    this.bnkService.getBankBranches(0,BankSno).subscribe((data:any )  =>   {        

      this.filteredBranches = this.RepledgeForm.controls['BankBranch'].valueChanges.pipe(
        startWith(null),
        map(brch => brch && typeof brch === 'object' ? brch['Branch_Name'] : brch ),
        map(brch => (brch ? this._filterBranch(brch) : this.branches.slice())), 
      );   
      this.branches     = (data);  
    });        
  }

  LoadParties()
  {    
    this.PartyService.getParties(0,1).subscribe((data:any )  =>   {        

      this.filteredParties = this.RepledgeForm.controls['Party'].valueChanges.pipe(
        startWith(null),
        map(pty => pty && typeof pty === 'object' ? pty['Party_Name'] : pty),
        map(pty => (pty ? this._filterParty(pty) : this.parties.slice())), 
      );   
      this.parties     = (data);  
    });        
  }

  ngOnInit(): void {
    this.AddNewRepledge();        
    this.LoadRepledge(this.data.Rp);    
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
        // this.urls = [];
        // this.urls.push  (result);     
        // console.log (this.urls);
        this.imagesCount = result.length;   
      }); 
  }

  
  AddNewRepledge()
  {     
    this.RepledgeForm = this.formBuilder.group
    ({
      TransSno        : [0, [Validators.required]],    
      Trans_No        : ["AUTO", [Validators.required]],    
      Trans_Date      : [new Date, [Validators.required]],
      Ref_No          : [""],
      Series          : [{SeriesSno:this.globals.VtypRepledge, Series_Name:"Repledge"}],
      Party           : [this.formBuilder.group( this.parties), [Validators.required]],
      Borrower        : [{BorrowerSno:this.data.Rp.Party.PartySno, Borrower_Name:this.data.Rp.Party.Party_Name}],
      Bank            : [this.formBuilder.group( this.banks), [Validators.required]],      
      BankBranch      : [{BranchSno:0, Branch_Name:""} ],
      Loan_Type       : [1, ],    
      Roi             : [this.data.Rp.Party.Roi,[Validators.required]],    
      Tenure          : [0, [Validators.required]],    
      DrAmount        : [0, ],    
      CrAmount        : [0, ],    
      PrincipalAmount : [0, ],    
      IntAmount       : [0, ],    
      Other_Charges   : [0, ],    
      Ref             : [{RefSno:0, Ref_No:""} ],    
      Remarks         : ["" ],   
      fileSource      : [this.TransImages],   
    });         
  } 
 
  LoadRepledge(Rp: TypeTransactions)
  {     
    this.CurrentTransSno = Rp.TransSno;
    this.RepledgeForm.controls['TransSno'].setValue(Rp.TransSno);    
    this.RepledgeForm.controls['Trans_No'].setValue(Rp.Trans_No);    
    this.RepledgeForm.controls['Trans_Date'].setValue(Rp.Trans_Date);    
    this.RepledgeForm.controls['Ref_No'].setValue(Rp.Ref_No);        
    this.RepledgeForm.controls['Series'].setValue({SeriesSno: Rp.Series.SeriesSno, Series_Name: Rp.Series.Series_Name } );    
    this.RepledgeForm.controls['Party'].setValue({PartySno: Rp.Party.PartySno, Party_Name: Rp.Party.Party_Name } );    
    this.RepledgeForm.controls['Borrower'].setValue({BorrowerSno: Rp.Borrower.BorrowerSno, Borrower_Name: Rp.Borrower.Borrower_Name });        
    this.RepledgeForm.controls['Bank'].patchValue({BankSno:Rp.Bank.BankSno, Bank_Name: Rp.Bank.Bank_Name});        
    this.RepledgeForm.controls['BankBranch'].patchValue({BranchSno:Rp.BankBranch.BranchSno, Branch_Name: Rp.BankBranch.Branch_Name});  
    this.RepledgeForm.controls['Loan_Type'].setValue(Rp.Loan_Type);        
    this.RepledgeForm.controls['Roi'].setValue(Rp.Roi);   
    this.RepledgeForm.controls['Tenure'].setValue(Rp.Tenure);   
    this.RepledgeForm.controls['DrAmount'].setValue(Rp.DrAmount);        
    this.RepledgeForm.controls['CrAmount'].setValue(Rp.CrAmount);        
    this.RepledgeForm.controls['Other_Charges'].setValue(Rp.Other_Charges);        
    this.RepledgeForm.controls['Ref'].patchValue({RefSno:Rp.Ref.RefSno, Ref_No: Rp.Ref.Ref_No});        
    this.RepledgeForm.controls['Remarks'].setValue(Rp.Remarks);    
    this.GrossWt = Rp.GrossWt;
    this.NettWt = Rp.NettWt;
    this.Purity = Rp.Purity;
    this.N916GrossWt = Rp.N916GrossWt;
    this.N916NettWt = Rp.N916NettWt;
    this.N916Purity = Rp.N916Purity;    
    
    this.TransService.getTransaction_Images(Rp.TransSno, ).subscribe((data:any ) =>  {               
      this.TransImages = data;
      this.RepledgeForm.controls['fileSource'].patchValue(data);  
      this.imagesCount = this.TransImages.length;
    });

  }
  
  GetWeightBalance(Pty: TypeParties)
  {    
    this.TransService.getWeightBalanceforParty(Pty.PartySno).subscribe((data:any ) =>  {                           
      this.WeightBalance  = (data.CrWeight - data.DrWeight) ;
      this.RepledgedWeight = (data.RpCrWeight - data.RpDrWeight) ;
      this.NonRepledgedWeight = (this.WeightBalance - this.RepledgedWeight);
    });
  }

  SaveRepledge(){          
    
    if (!this.RepledgeForm.controls['Bank'].value.BankSno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Acount "} });
      dialogRef.disableClose = true;      
      return;
    }

    if (!this.RepledgeForm.controls['BankBranch'].value.BranchSno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Bank Branch "} });
      dialogRef.disableClose = true;      
      return;
    }

    if (this.RepledgeForm.controls['Tenure'].value < 1 )
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Enter Tenure of Loan "} });
      dialogRef.disableClose = true;      
      return;
    }

    if (!this.RepledgeForm.controls['Party'].value.PartySno)
    {
      const dialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": "Select the Customer "} });
      dialogRef.disableClose = true;      
      return;
    }

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

    if(this.RepledgeForm.valid){
      
      const dialogRef = this.dialog.open(MsgboxComponent, 
        {
          data: { "DialogType": 0}}
        );
      dialogRef.disableClose = true;


      this.TransService.saveTransaction (Object(this.RepledgeForm.value),StrItemXml,StrImageXml).subscribe((data:any ) => {
        
        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            const ErrdialogRef = this.dialog.open(MsgboxComponent, {data: {"DialogType":1, "Message": data.apiData} });
            ErrdialogRef.disableClose = true;
            dialogRef.close();
            break;
          case 1:
            this.bcastService.sendUpdate(true);
            this._snackBar.open('Repledge created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
 
  DeleteRepledge(){         
    if (this.RepledgeForm.controls['TransSno'].value == 0)
    {
      this._snackBar.open('Error !! No Repledge is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else 
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Repledge?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.TransService.deleteTransaction(Object(this.RepledgeForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Repledge Deleted successfully"},
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

  CreateRelease()
  {
    var Rel: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VtypRelease, Series_Name: "Release"},      
      Party:  {PartySno: this.RepledgeForm.controls['Party'].value.PartySno, Party_Name: this.RepledgeForm.controls['Party'].value.Party_Name},
      Borrower: {BorrowerSno: this.RepledgeForm.controls['Borrower'].value.BorrowerSno, Borrower_Name: this.RepledgeForm.controls['Borrower'].value.Borrower_Name},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 0,
      Roi: 0,
      Tenure: 0,
      DrAmount: this.RepledgeForm.controls['CrAmount'].value,
      CrAmount: 0,
      PrincipalAmount: 0,
      IntAmount: 0,
      Other_Charges: 0,
      Ref: {RefSno: this.RepledgeForm.controls['TransSno'].value, Ref_No: this.RepledgeForm.controls['Trans_No'].value},
      Remarks: "",
      GrossWt: 0,
      NettWt: 0,
      Purity: 91.6,
      N916GrossWt: 0,
      N916NettWt: 0,
      N916Purity: 75,
      fileSource:[]
    }

    this.TransService.getReleaseforRp(this.RepledgeForm.controls['TransSno'].value).subscribe((data:any )  =>   {      

        if (!data) 
        {
          console.log ("no data");
        }
        else
        {
          Rel = data[0];         
        }      
        const dialogRef = this.dialog.open(ReleaseComponent, 
          {
           data: {Rel},
          });
          
          dialogRef.disableClose = true;
    
          dialogRef.afterClosed().subscribe(result => {     
            
          }); 
    });  

    
    
  }

  CreateRpPayment()
  {
    var Rpp: TypeTransactions = {
      TransSno: 0,      
      Trans_No: "AUTO",
      Trans_Date: new Date(),
      Ref_No: "",
      Series: {SeriesSno: this.globals.VTypRpPayment, Series_Name: "RP Payment"},      
      Party:  {PartySno: this.RepledgeForm.controls['Party'].value.PartySno, Party_Name: this.RepledgeForm.controls['Party'].value.Party_Name},
      Borrower: {BorrowerSno: this.RepledgeForm.controls['Borrower'].value.BorrowerSno, Borrower_Name: this.RepledgeForm.controls['Borrower'].value.Borrower_Name},
      Bank:  {BankSno: 0, Bank_Name: ""},
      BankBranch:  {BranchSno: 0, Branch_Name: ""},
      Loan_Type: 0,
      Roi: 0,
      Tenure: 0,
      DrAmount: 0,
      CrAmount: 0,
      PrincipalAmount: 0,
      IntAmount: 0,
      Other_Charges: 0,
      Ref: {RefSno: this.RepledgeForm.controls['TransSno'].value, Ref_No: this.RepledgeForm.controls['Trans_No'].value},
      Remarks: "",
      GrossWt: 0,
      NettWt: 0,
      Purity: 91.6,
      N916GrossWt: 0,
      N916NettWt: 0,
      N916Purity: 75,
      fileSource:[]
    }

    const dialogRef = this.dialog.open(RppaymentComponent, 
      {
       data: {Rpp},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {     
        
      }); 
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
          this.bank.nativeElement.focus();   
          break;
        case "roi":
          this.cramount.nativeElement.focus();   
          break;
        case "cramount":
          this.party.nativeElement.focus();   
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
