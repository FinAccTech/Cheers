
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';

@Component({
  selector: 'app-borrowermaster',
  templateUrl: './borrowermaster.component.html',
  styleUrls: ['./borrowermaster.component.css']
})



export class BorrowermasterComponent implements OnInit {

  PartyForm!: FormGroup;  
  PartyType: string ="";
  SrcPath: string = ""

  constructor(
    public dialogRef: MatDialogRef<BorrowermasterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder, 
    private PtyService:PartyService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {     
    this.PartyType = "Borrowers";
    this.SrcPath = "assets/images/borrower.png";
    this.AddNewParty();    
    this.LoadParty(this.data.Bwr);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  AddNewParty()
  {    
    this.PartyForm = this.formBuilder.group
    ({
      PartySno        : [0, [Validators.required]],    
      Party_Type      : [this.data.Party_Type, [Validators.required]],    
      Party_Name      : ["", [Validators.required]],
      Address         : [""],
      City            : [""],
      Mobile          : [""],
      Email           : [""],
      Remarks         : [""],
      Roi             : [0],
      Scheme          : [1],
    });    
    
  }
 
  LoadParty(Pty: TypeParties)
  { 
    this.PartyForm.controls['PartySno'].setValue(Pty.PartySno);    
    this.PartyForm.controls['Party_Type'].setValue(Pty.Party_Type);    
    this.PartyForm.controls['Party_Name'].setValue(Pty.Party_Name);    
    this.PartyForm.controls['Address'].setValue(Pty.Address);    
    this.PartyForm.controls['City'].setValue(Pty.City);    
    this.PartyForm.controls['Mobile'].setValue(Pty.Mobile);    
    this.PartyForm.controls['Email'].setValue(Pty.Email);        
    this.PartyForm.controls['Remarks'].setValue(Pty.Remarks);        
  }
  
  SaveParty(){       
    if(this.PartyForm.valid){

      this.PtyService.saveParty (Object(this.PartyForm.value)).subscribe((data:any ) => {

        switch (data.queryStatus) {
          case 0:
            alert ("Error!!! " + data.apiData );
            break;
          case 1:                                                    
            this._snackBar.open('Party created successfully', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
            this.dialogRef.close(Object(this.PartyForm.value));
            break;
          default:
            alert ("Error!!!")
            break;
        }      
  
      });
    }
  }
 
  DeleteParty(){         
    if (this.PartyForm.controls['PartySno'].value == 0)
    {
      this._snackBar.open('Error !! No Customer is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
    }

    else
    {

      const dialogRef1 = this.dialog.open(MsgboxComponent, 
        {
        data: {DialogType:3, Message: "Are you sure you want to delete this Borrower?"},
        });
        
        dialogRef1.disableClose = true; 
  
        dialogRef1.afterClosed().subscribe(actionBack => {        
          if (actionBack == 1) 
          { 
            this.PtyService.deleteParty(Object(this.PartyForm.value)).subscribe((data:any ) => {
        
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
                  data: {DialogType:2, Message: "Borrower Deleted successfully"},
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
