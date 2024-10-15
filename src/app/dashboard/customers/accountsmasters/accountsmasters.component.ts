import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TypeAccounts } from '../../types/TypeAccounts';
import { PartyService } from '../../party.service';
import { AccountmasterComponent } from './accountmaster/accountmaster.component';
import { MsgboxComponent } from '../../msgbox/msgbox.component';

@Component({
  selector: 'app-accountsmasters',
  templateUrl: './accountsmasters.component.html',
  styleUrls: ['./accountsmasters.component.css']
})
export class AccountsmastersComponent implements OnInit {

  displayedColumns: string[] = ['Sno', 'Comp_Code', 'Account_No', 'Party_Name', 'City','Mobile','Roi','Edit_Delete']; 
  dataSource!: MatTableDataSource<TypeAccounts>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
   
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  AccountsList: TypeAccounts[] = []; 
  constructor(private PtyService: PartyService, public dialog: MatDialog, private router: Router, private _snackBar: MatSnackBar) { 
    this.LoadAccountsList();    
  }

  ngOnInit(): void {
  }
 
  LoadAccountsList()
  { 
   this.loadingData = true;
    this.PtyService.getAccounts(0,0).subscribe((data:any ) =>  {         
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
      }
      else{              
         this.AccountsList = data;            
         this.LoadAccountsListintoMatGrid();          
      }              
    });    
    this.loadingData = false; 
  }
  LoadAccountsListintoMatGrid()
  {
     this.dataSource = new MatTableDataSource<TypeAccounts> (this.AccountsList);         
     setTimeout(() => this.dataSource.paginator = this.paginator);
     setTimeout(() => this.dataSource.sort = this.sort);
  } 

  OpenAccountCreation(){
    var Acc: TypeAccounts = {
        AccountSno: 0,
        Account_No: "",
        Account_Date: "",
        Party: {"PartySno":0, "Party_Name":"", "Party_Type":1,"Roi":0},
        Company: {CompSno:0, Comp_Code:"", Comp_Name:""},
        Remarks: "",
        NewPrincipal: 0,
        IntLastUpdate: new Date(),
        Roi: 0,
        Scheme: 1,
      } 

    const dialogRef = this.dialog.open(AccountmasterComponent, 
      {
      data: Acc,
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          //this.AccountsList.unshift(result);            
          //this.LoadAccountsListintoMatGrid();        
          this.LoadAccountsList();
        }
        
      });  
  }

  AlterAccount(Acc: TypeAccounts)
  {
    const dialogRef = this.dialog.open(AccountmasterComponent, 
      {
      data: Acc, 
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        
        if (result)
        {
          if (result == "Delete")
          {
            const index =  this.AccountsList.indexOf(Acc);
            this.AccountsList.splice(index, 1);
            this.LoadAccountsListintoMatGrid();
          }
          else
          {
            const index =  this.AccountsList.indexOf(Acc);
            this.AccountsList[index] = result;
            this.AccountsList = Object.assign([], this.AccountsList);
            this.LoadAccountsListintoMatGrid();        
          }          
        }
        
      });  
  }
  
  DeleteAccount(Acc: TypeAccounts){         
    if (Acc.AccountSno == 0)
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
            this.PtyService.deleteAccount(Acc).subscribe((data:any ) => {
        
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
                  const index =  this.AccountsList.indexOf(Acc);
                  this.AccountsList.splice(index, 1);
                  this.LoadAccountsListintoMatGrid();              
              }          
            });
          }
          
        });  
    }
    
  }


  applyFilterParty(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
 