import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TypeBanks } from '../types/TypeBanks';
import { BankService } from './bank.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TypeBankBranches } from '../types/TypeBankBranches';
import { BankmasterComponent } from './bankmaster/bankmaster.component';
import { BankbranchesComponent } from './bankbranches/bankbranches.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsgboxComponent } from '../msgbox/msgbox.component';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {

  displayedBankColumns: string[] = ['Sno', 'Bank_Name', 'Acc_Name','Acc_No','Acc_Type','Acc_Cat','Crud'];

  dataSourceBank!: MatTableDataSource<TypeBanks>; 
  @ViewChild(MatPaginator) paginatorBank!: MatPaginator;
  @ViewChild(MatSort) sortBank!: MatSort;  

  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  searchText: string = "";
  BanksList: TypeBanks[] = [];

  constructor(private BnkService: BankService, public dialog: MatDialog, private _snackBar: MatSnackBar) { 
    this.LoadBanksList();     
  }

  ngOnInit(): void {
  }


  LoadBanksList()
   { 
    this.loadingData = true;
     this.BnkService.getBanks(0,0).subscribe((data:any ) =>  {             
       if (data === 0)
       {
         this.dataError  = true;
         this.errDetails = data; 
       }
       else{              
          this.BanksList = data;                          
          this.LoadBanksListintoMatGrid();          
       }               
     });    
     this.loadingData = false;
   }

   LoadBanksListintoMatGrid() 
   {      
      this.dataSourceBank = new MatTableDataSource<TypeBanks> (this.BanksList);         
      setTimeout(() => this.dataSourceBank.paginator = this.paginatorBank);
      setTimeout(() => this.dataSourceBank.sort = this.sortBank);
   }

   OpenBankCreation(){
    var Bnk: TypeBanks = {
      BankSno: 0,
      Bank_Name: "",      
      Acc_Cat: 1,
      Acc_Name: "",
      Acc_No: "", 
      Acc_Type: 1,      
  }    
     
    const dialogRef = this.dialog.open(BankmasterComponent, 
      {
      data: {Bnk},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {         
        if (result)     
        {
          // this.BanksList.unshift(result);            
          // this.LoadBanksListintoMatGrid();         
          this.LoadBanksList();
        }        
        
      });  
  } 

  OpenBranchCreation(){
    var SelectedBranch: TypeBankBranches= {
      BranchSno: 0,
      Bank: {BankSno : 0, Bank_Name: "" },
      Branch_Name: "",      
      Branch_Address: "",
      Remarks: ""      
  }
    const dialogRef = this.dialog.open(BankbranchesComponent, 
      {
      data: SelectedBranch,
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {              
        
      }); 
  }

  AlterBank(Bnk: TypeBanks)
  {
    const dialogRef = this.dialog.open(BankmasterComponent, 
      {
      data: {Bnk},
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        if (result)
        {
          if (result == "Delete")
          {
            const index =  this.BanksList.indexOf(Bnk);
            this.BanksList.splice(index, 1);
            this.LoadBanksListintoMatGrid();
          }
          else
          {
            const index =  this.BanksList.indexOf(Bnk);
            this.BanksList[index] = result;
            this.BanksList = Object.assign([], this.BanksList);
            this.LoadBanksListintoMatGrid();        
          }          
        }
        
      });  
  }

  DeleteBank(Bnk: TypeBanks){         
    if (Bnk.BankSno == 0)
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
            this.BnkService.deleteBank(Bnk).subscribe((data:any ) => {
        
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
                  const index =  this.BanksList.indexOf(Bnk);
                  this.BanksList.splice(index, 1);
                  this.LoadBanksListintoMatGrid();              
              }          
            });
          }
          
        });        
    }    
  }
  

  applyFilterBank(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBank.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceBank.paginator) {
      this.dataSourceBank.paginator.firstPage();
    }
  }
}
