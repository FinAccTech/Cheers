
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeBankBranches } from '../../types/TypeBankBranches';
import { BankService } from '../bank.service';
import { TypeBanks } from '../../types/TypeBanks';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-bankbranches',
  templateUrl: './bankbranches.component.html',
  styleUrls: ['./bankbranches.component.css']
})
export class BankbranchesComponent implements OnInit {

  BranchForm!: FormGroup;    
  filteredBanks!: Observable<TypeBanks[]>;   
  banks: TypeBanks[] = [ ];

  constructor(
    public dialogRef: MatDialogRef<BankbranchesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TypeBankBranches,
    private formBuilder:FormBuilder, 
    private BnkService:BankService,
    private _snackBar: MatSnackBar
  ) {}
  
  displayBank(bnk: TypeBanks): string {
    return bnk && bnk.Bank_Name ? bnk.Bank_Name : '';
  }
  
  private _filterBank(value: string): TypeBanks[] {
    const filterValue = value.toLowerCase();    
    return this.banks.filter(bnk => bnk.Bank_Name.toLowerCase().includes(filterValue));                
  }

  ngOnInit(): void {
    this.AddNewBankBranch();    
  }

  LoadBanks()
  {
    this.BnkService.getBanks(0,0).subscribe((data:any )  =>   {        

      this.filteredBanks = this.BranchForm.controls['Bank'].valueChanges.pipe(
        startWith(null),
        map(bnk => bnk && typeof bnk === 'object' ? bnk['Bank_Name'] : bnk),
        map(bnk => (bnk ? this._filterBank(bnk) : this.banks.slice())), 
      );   
      this.banks     = (data);  
    });  
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  SetResponse(resp: string){
    //this.data.Response = resp;
  }

  AddNewBankBranch()
  {    
    this.BranchForm = this.formBuilder.group
    ({
      BranchSno       : [0, [Validators.required]],    
      Bank            : [this.formBuilder.group( this.banks ), [Validators.required]],    
      Branch_Name     : [""],    
      Branch_Address  : [""],
      Remarks         : [""],      
    });    
    
  }

  LoadBankBranch(Brch: TypeBankBranches)
  { 
    this.BranchForm.controls['BranchSno'].setValue(Brch.BranchSno);    
          
    this.BranchForm.controls['Bank'].patchValue({BankSno:Brch.Bank.BankSno, Bank_Name: Brch.Bank.Bank_Name});    
    this.BranchForm.controls['Branch_Name'].setValue(Brch.Branch_Name);    
    this.BranchForm.controls['Branch_Address'].setValue(Brch.Branch_Address);    
    this.BranchForm.controls['Remarks'].setValue(Brch.Remarks);        
  }
  
  SaveBankBranch(){              
    
    if(this.BranchForm.valid){

      this.BnkService.saveBankBranch(Object(this.BranchForm.value)).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            break;
          case 1:
            this.AddNewBankBranch();
            this._snackBar.open('Bank Branch created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
            this.dialogRef.close();
            break;
          default:
            alert ("Error!!!")
            break;
        }     
  
      });
    }
  }
 
  DeleteBankBranch(){         
    if (this.BranchForm.controls['BranchSno'].value == 0)
    {
      alert ("No Bank Branch is selected to delete");
    }

    else
    {
      if (confirm("Are you sure you want to delete this Bank Branch")  == true)
      {
        this.BnkService.deleteBank(Object(this.BranchForm.value)).subscribe((data:any ) => {
        
          if (data.queryStatus == 0)
          {
            alert ("Error !!! " + data.apiData);
          }
          else
          {
            alert ("Bank Branch deleted sucessfully");
          }          
        });
      }
    }
    
  }

}
