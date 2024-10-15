import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { PartyService } from 'src/app/dashboard/party.service';
import { TypeAccounts } from 'src/app/dashboard/types/TypeAccounts';
import { MsgboxComponent } from 'src/app/dashboard/msgbox/msgbox.component';
import { TypeParties } from 'src/app/dashboard/types/TypeParties';
import { map, Observable, startWith } from 'rxjs';
import { TypeCompanies } from 'src/app/dashboard/types/TypeCompanies';
import { TransactionService } from 'src/app/dashboard/transaction.service';


interface Scheme {
  value : number;
  text: string;
}

@Component({
  selector: 'app-accountmaster',
  templateUrl: './accountmaster.component.html',
  styleUrls: ['./accountmaster.component.css']
})

export class AccountmasterComponent implements OnInit {

  AccountForm!: FormGroup;    
  AccountImage: string =  "assets/images/person.jpeg";

  PartiesList: TypeParties[] = [];
  filteredParties!: Observable<TypeParties[]>;   

  CompaniesList: TypeCompanies[] = [];
  filteredCompanies!: Observable<TypeCompanies[]>;   

  Schemes: Scheme[] = [
    {value: 1, text: "Simple"},
    {value: 2, text: "Compound"}
  ];
  
  SelectedScheme = this.Schemes[0].value;

  constructor(
    public dialogRef: MatDialogRef<AccountmasterComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeAccounts,
    private formBuilder:FormBuilder, 
    private PtyService:PartyService,
    private TransService:TransactionService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {    
    this.AddNewAccount();
    if (this.data.AccountSno !== 0){
      this.LoadAccount(this.data);                
    }
    
    
    if (this.data.Party){
      this.AccountForm.controls['Party'].setValue({PartySno: this.data.Party!.PartySno, Party_Name: this.data.Party!.Party_Name } );        
      this.AccountForm.controls['Company'].setValue({CompSno: this.data.Company!.CompSno, Comp_Name: this.data.Company!.Comp_Name } );        
    }
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  AddNewAccount()
  {    
    this.AccountForm = this.formBuilder.group
    ({
      AccountSno        : [0],    
      Account_No        : ["AUTO", [Validators.required]],    
      Account_Date      : [new Date().toLocaleDateString(), [Validators.required]],
      Account_DateStr   : [new Date().toLocaleDateString(), [Validators.required]],
      Party             : [this.formBuilder.group( this.PartiesList), [Validators.required]],
      Roi               : [0, [Validators.required]],
      Company            : [this.formBuilder.group( this.CompaniesList), [Validators.required]],
      Scheme            : [0,],       
      Remarks            : ["",],       
    });   
  }

  LoadAccount(Acc: TypeAccounts)
  {         
    this.AccountForm.controls['AccountSno'].setValue(Acc.AccountSno);    
    this.AccountForm.controls['Account_No'].setValue(Acc.Account_No);    
    this.AccountForm.controls['Account_Date'].setValue(Acc.Account_Date);  
    this.AccountForm.controls['Account_DateStr'].setValue(Acc.Account_DateStr);            
    this.AccountForm.controls['Party'].setValue({PartySno: Acc.Party!.PartySno, Party_Name: Acc.Party!.Party_Name } );        
    this.AccountForm.controls['Company'].setValue({CompSno: Acc.Company!.CompSno, Comp_Name: Acc.Company!.Comp_Name } );        
    this.AccountForm.controls['Roi'].setValue(Acc.Roi);   
    this.AccountForm.controls['Scheme'].setValue(Acc.Scheme);       
    this.AccountForm.controls['Remarks'].setValue(Acc.Remarks);        
  }
  
  LoadParties()
  {    
    this.PtyService.getParties(0,1).subscribe((data:any )  =>   {       
      // this.AccountForm.controls['Party'].patchValue({PartySno:0, Party_Name: ""});  
      this.filteredParties = this.AccountForm.controls['Party'].valueChanges.pipe(
        startWith(null),
        map(pty => pty && typeof pty === 'object' ? pty['Party_Name'] : pty ),
        map(pty => (pty ? this._filterParty(pty) : this.PartiesList.slice())), 
      );   
      this.PartiesList     = (data);  
    });        
  }

  private _filterParty(value: string): TypeParties[] {
    const filterValue = value.toLowerCase();    
    return this.PartiesList.filter(pty => pty.Party_Name.toLowerCase().includes(filterValue));                
  }
  displayParty(pty: TypeParties): string {
    return pty && pty.Party_Name ? pty.Party_Name : '';
  }

  LoadCompanies()
  {    
    this.TransService.getCompanies(0).subscribe((data:any )  =>   {             
      this.filteredCompanies = this.AccountForm.controls['Company'].valueChanges.pipe(
        startWith(null),
        map(comp => comp && typeof comp === 'object' ? comp['Comp_Name'] : comp ),
        map(comp => (comp ? this._filterCompany(comp) : this.CompaniesList.slice())), 
      );   
      this.CompaniesList     = (data);  
    });        
  }

  private _filterCompany(value: string): TypeCompanies[] {
    const filterValue = value.toLowerCase();    
    return this.CompaniesList.filter(comp => comp.Comp_Name.toLowerCase().includes(filterValue));                
  }

  displayCompany(comp: TypeCompanies): string {
    return comp && comp.Comp_Name ? comp.Comp_Name: '';
  }

  SaveAccount(){   
    if (this.AccountForm.controls['Roi'].value == 0)
    {
      this._snackBar.open('Rate of Interest cannot be zero.', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
      return;
    }
    
    if(this.AccountForm.valid){
      this.PtyService.saveAccount (Object(this.AccountForm.value)).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            break;
          case 1:                                                    
            this._snackBar.open('Account created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
            this.dialogRef.close(Object(this.AccountForm.value));
            break;
          default:
            alert ("Error!!!")
            break;
        }        
      });
    }
  }
 
  DeleteAccount(){         
    if (this.AccountForm.controls['AccountSno'].value == 0)
    {
      this._snackBar.open('Error !! No Account is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Account?"},
        });        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.PtyService.deleteAccount(Object(this.AccountForm.value)).subscribe((data:any ) => {        
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
                  data: {DialogType:2, Message: "Account Deleted successfully"},
                  });
                  
                  dialogRef3.disableClose = true; 
                  this.dialogRef.close("Delete");
              }          
            });
          }          
        });  
    }    
  }

  selectFile($event: any)
  {
    const file = $event?.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL($event.target.files[0]);    

    reader.onload = (event: any) => {
      this.AccountImage = event.target.result;
    
    }

  }
}
