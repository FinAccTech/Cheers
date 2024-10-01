
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeBanks } from 'src/app/dashboard/types/TypeBanks';
import { BankService } from '../bank.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';

interface AccCategory{
  value : number;
  text: string;
}

interface AccType {
  value : number;
  text: string;
}

@Component({
  selector: 'app-bankmaster',
  templateUrl: './bankmaster.component.html',
  styleUrls: ['./bankmaster.component.css']
})

export class BankmasterComponent implements OnInit {

  AccCategories: AccCategory[] = [
    {value: 1, text: "Own Account"},
    {value: 2, text: "Borrower Account"}
  ];

  AccTypes: AccType[] = [
    {value: 1, text: "Savings"},
    {value: 2, text: "Current"}
  ];

  SelectedAccCategory = this.AccCategories[0].value;
  SelectedAccType = this.AccTypes[0].value;

  BankForm!: FormGroup;    
  
  constructor(
    public dialogRef: MatDialogRef<BankmasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder, 
    private BnkService:BankService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.AddNewBank();           
    this.LoadBank(this.data.Bnk);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  SetResponse(resp: string){
    //this.data.Response = resp; 
  }

  AddNewBank()
  {    
    this.BankForm = this.formBuilder.group
    ({
      BankSno         : [0, [Validators.required]],    
      Bank_Name       : ["", [Validators.required]],    
      Acc_Cat         : [1, [Validators.required]],
      Acc_Name        : [""],
      Acc_No          : [""],
      Acc_Type        : [1, [Validators.required]],       
    });    
    
  }

  LoadBank(Bnk: TypeBanks)
  {     
    this.BankForm.controls['BankSno'].setValue(Bnk.BankSno);    
    this.BankForm.controls['Bank_Name'].setValue(Bnk.Bank_Name);    
    this.BankForm.controls['Acc_Cat'].setValue(Bnk.Acc_Cat);    
    this.SelectedAccCategory = this.AccCategories[Bnk.Acc_Cat - 1].value;
    this.BankForm.controls['Acc_Name'].setValue(Bnk.Acc_Name);    
    this.BankForm.controls['Acc_No'].setValue(Bnk.Acc_No);    
    this.BankForm.controls['Acc_Type'].setValue(Bnk.Acc_Type);           
    this.SelectedAccType = this.AccTypes[Bnk.Acc_Type - 1].value; 
  }
  
  SaveBank(){              
    
    console.log (this.BankForm.value);
    if(this.BankForm.valid){

      this.BnkService.saveBank (Object(this.BankForm.value)).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            break;
          case 1:            
            this._snackBar.open('Bank created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
            this.dialogRef.close(Object(this.BankForm.value));            
            break;
          default:
            alert ("Error!!!")
            break;
        }     
  
      });
    }
  }
 
  DeleteBank(){         
    if (this.BankForm.controls['BankSno'].value == 0)
    {
      this._snackBar.open('Error !! No Bank is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }
    else
    {
      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Bank?"},
        });
        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.BnkService.deleteBank(Object(this.BankForm.value)).subscribe((data:any ) => {
        
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
                  data: {DialogType:2, Message: "Bank Deleted successfully"},
                  });
                  
                  dialogRef3.disableClose = true; 
                  this.dialogRef.close("Delete");
              }          
            });
          }
          
        });  

      
    }
    
  }


}
