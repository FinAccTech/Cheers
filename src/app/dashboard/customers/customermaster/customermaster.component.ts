import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { FileHandle } from '../../types/file-handle';
import { DomSanitizer } from '@angular/platform-browser';
import { AppGlobalsService } from '../../app-globals.service';
import { MoreinfoComponent } from '../moreinfo/moreinfo.component';

interface Scheme {
  value : number;
  text: string;
}

interface Salutation {
  value : number;
  text: string;
}

interface SexTypes{
  value: number;
  text: string;
}

interface TypeCustomerTypes{
  value: number;
  text: string;
}

@Component({
  selector: 'app-customermaster',
  templateUrl: './customermaster.component.html',
  styleUrls: ['./customermaster.component.css']
})

export class CustomermasterComponent implements OnInit {

  PartyForm!: FormGroup;  
  PartyType: string ="";

  TransImages!: FileHandle;
  
  Schemes: Scheme[] = [
    {value: 1, text: "Simple"},
    {value: 2, text: "Compound"}
  ];
  
  Salutations: Salutation[] = [
    {value: 1, text: "Mr"},
    {value: 2, text: "Mrs"}
  ];

  Sexes: SexTypes[] = [
    {value: 1, text: "Male"},
    {value: 2, text: "Female"}
  ];

  CustomerTypes: TypeCustomerTypes[] = [
    {value: 1, text: "Good"},
    {value: 2, text: "Very Good"},
    {value: 3, text: "Average"},
    {value: 4, text: "Bad"}    
  ];

  rating: number = 0;

  SelectedScheme        = this.Schemes[0].value;
  SelectedSalutation    = this.Salutations[0].value;
  SelectedSex           = this.Sexes[0].value;
  SelectedCustomerType  = this.CustomerTypes[0].value;

  constructor(
    public dialogRef: MatDialogRef<CustomermasterComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder:FormBuilder, 
    private PtyService:PartyService,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private globals: AppGlobalsService
  ) {}

  ngOnInit(): void {         
    switch (this.data.Cust.Party_Type) {
      case 1:
        this.PartyType = "Customer";        
        break;
      case 2:
        this.PartyType = "Borrower";        
        break;      
    }
    
    this.AddNewParty();    
    if (this.data.Cust.PartySno !==0){
      this.LoadParty(this.data.Cust); 
    }    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  AddNewParty()
  {    
    this.PartyForm = this.formBuilder.group
    ({
      PartySno        :   [0, [Validators.required]],    
      Party_Type      :   [this.data.Cust.Party_Type, [Validators.required]],                
      Party_Name      :   ["", [Validators.required]],
      Address         :   [""],
      City            :   [""],
      Mobile          :   ["",],
      Email           :   [""],
      Remarks         :   [""],
      Roi             :   [0, [Validators.required]], 
      Scheme          :   [1],       
      Sex             :   [1],
      Aadhar_No       :   [""],
      Pan_No          :   [""],
      Salutation      :   [1],
      Ratings         :   [0],
      Customer_Type   :   [1],
      fileSource      :   [{"DelStatus":0, "Image_File":null!, "Image_Url":"", "SrcType":1,"Image_Name":""}],      
      Party_Image     :   [""],
      Image_Name      :   [""],
      Enable_App      :   [0],
      App_Code        :   [""],
      Enable_Accounts :   [0],
      Enable_TopUp    :   [0],
      Enable_Shop     :   [0],

    });    

    this.TransImages = {"DelStatus":0, "Image_File":null!, "Image_Url":"", "SrcType":1,"Image_Name":""} ;    
  }

  LoadParty(Pty: TypeParties)
  { 
    this.PartyForm.controls['PartySno'].setValue(Pty.PartySno);    
    this.PartyForm.controls['Party_Type'].setValue(Pty.Party_Type);    
    this.PartyForm.controls['Salutation'].setValue(Pty.Salutation);   
    this.PartyForm.controls['Sex'].setValue(Pty.Sex);   
    this.PartyForm.controls['Party_Name'].setValue(Pty.Party_Name);    
    this.PartyForm.controls['Address'].setValue(Pty.Address);    
    this.PartyForm.controls['City'].setValue(Pty.City);    
    this.PartyForm.controls['Mobile'].setValue(Pty.Mobile);    
    this.PartyForm.controls['Email'].setValue(Pty.Email);        
    this.PartyForm.controls['Remarks'].setValue(Pty.Remarks);        
    this.PartyForm.controls['Roi'].setValue(Pty.Roi);        
    this.PartyForm.controls['Scheme'].setValue(Pty.Scheme);        
    this.PartyForm.controls['Aadhar_No'].setValue(Pty.Aadhar_No);        
    this.PartyForm.controls['Pan_No'].setValue(Pty.Pan_No);  
    this.PartyForm.controls['Ratings'].setValue(Pty.Ratings);  
    this.PartyForm.controls['Customer_Type'].setValue(Pty.Customer_Type);  
    this.PartyForm.controls['Party_Image'].setValue(Pty.Party_Image);  
    this.PartyForm.controls['Image_Name'].setValue(Pty.Image_Name);  
    this.PartyForm.controls['fileSource'].setValue({"DelStatus":0, "Image_File":null!, "Image_Url":Pty.Party_Image, "SrcType":1,"Image_Name":Pty.Image_Name});  
    this.rating = Pty.Ratings!;
    this.TransImages = {"DelStatus":0, "Image_File":null!, "Image_Url":Pty.Party_Image!, "SrcType":1,"Image_Name":Pty.Image_Name!} ;
    
    this.PartyForm.controls['Enable_App'].setValue(Pty.Enable_App);  
    this.PartyForm.controls['App_Code'].setValue(Pty.App_Code);  
    this.PartyForm.controls['Enable_Accounts'].setValue(Pty.Enable_Accounts);  
    this.PartyForm.controls['Enable_TopUp'].setValue(Pty.Enable_TopUp);  
    this.PartyForm.controls['Enable_Shop'].setValue(Pty.Enable_Shop);  

  }
  
  SaveParty(){   
    // if (this.PartyForm.controls['Roi'].value == 0)
    // {
    //   this._snackBar.open('Rate of Interest cannot be zero.', 'Success',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['mat-toolbar', 'mat-primary'] });                        
    //   return;
    // }
    
    if (!this.TransImages || this.TransImages.Image_Name ==''){
      this.PartyForm.controls['Party_Image'].setValue('');
    }
    else{
      this.PartyForm.controls['Party_Image'].setValue(this.globals.PartyImageUrl + '/'+ this.TransImages.Image_Name );
    }

    
    this.PartyForm.controls['Image_Name'].setValue(this.TransImages.Image_Name);
    this.PartyForm.controls['fileSource'].setValue(this.TransImages);
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
        data: {DialogType:3, Message: "Are you sure you want to delete this Customer?"},
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
                  data: {DialogType:2, Message: "Customer Deleted successfully"},
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
    if ($event.target.files)
    {  
        const file = $event?.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[0]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={
            Image_Name: file.name,
            Image_File: event.target.result,  
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0
          };               
          this.TransImages = (fileHandle);          
        }
      // }        
    } 
  }

  getNewRating($event: number){
    this.rating = $event;
    this.PartyForm.controls['Ratings'].setValue(this.rating);  
  }
  
  OpenAppControl(){
    const dialogRef = this.dialog.open(MoreinfoComponent, 
      {
        data: Object(this.PartyForm).value,
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          this.PartyForm.controls['Enable_App'].setValue(result.Enable_App);  
          this.PartyForm.controls['App_Code'].setValue(result.App_Code);  
          this.PartyForm.controls['Enable_Accounts'].setValue(result.Enable_Accounts);  
          this.PartyForm.controls['Enable_TopUp'].setValue(result.Enable_TopUp);  
          this.PartyForm.controls['Enable_Shop'].setValue(result.Enable_Shop);          
        }
        
      });  
  }
}
