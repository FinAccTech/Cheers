import { Component, OnInit, ViewChild } from '@angular/core';
import { PartyService } from '../party.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TypeParties } from '../types/TypeParties';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BorrowermasterComponent } from './borrowermaster/borrowermaster.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsgboxComponent } from '../msgbox/msgbox.component';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.component.html',
  styleUrls: ['./borrowers.component.css']
})
export class BorrowersComponent implements OnInit {

  displayedBwrColumns: string[] = [ 'Sno', 'Party_Name', 'City','Mobile','Crud'];

  dataSourceBwr!: MatTableDataSource<TypeParties>;

  @ViewChild(MatPaginator) paginatorBwr!: MatPaginator;
  @ViewChild(MatSort) sortBwr!: MatSort;  

  BwrList: TypeParties[] = [];
  
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  constructor(private PtyService:PartyService, public dialog: MatDialog, private router: Router, private _snackBar: MatSnackBar) { 
    this.LoadBwrList();     
  }


  ngOnInit(): void {
  }

  LoadBwrList()
  { 
   this.loadingData = true;
    this.PtyService.getParties(0,2).subscribe((data:any ) =>  {                    
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
      }
      else{              
         this.BwrList = data;            
         this.LoadBwrListintoMatGrid();          
      }              
    });    
    this.loadingData = false;
  }

  LoadBwrListintoMatGrid()
  {
     this.dataSourceBwr = new MatTableDataSource<TypeParties> (this.BwrList);         
     setTimeout(() => this.dataSourceBwr.paginator = this.paginatorBwr);
     setTimeout(() => this.dataSourceBwr.sort = this.sortBwr);
  }

  
  OpenBorrowerCreation(){
    var Bwr: TypeParties = {
      PartySno: 0,
      Party_Type: 2,
      Party_Name: "",
      Address: "",
      City: "",
      Mobile: "",
      Email: "",    
      Remarks: "",
      Roi:0,
      Scheme:1
  }
    const dialogRef = this.dialog.open(BorrowermasterComponent, 
      {
      data: {Bwr},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {        
        if (result)
        {
          // this.BwrList.unshift(result);            
          // this.LoadBwrListintoMatGrid();   
          this.LoadBwrList();     
        }
        
      });  
  }

  AlterBorrower(Bwr: TypeParties)
  {
    const dialogRef = this.dialog.open(BorrowermasterComponent, 
      {
      data: {Bwr},
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        if (result)
        {
          if (result == "Delete")
          {
            const index =  this.BwrList.indexOf(Bwr);
            this.BwrList.splice(index, 1);
            this.LoadBwrListintoMatGrid();
          }
          else
          {
            const index =  this.BwrList.indexOf(Bwr);
            this.BwrList[index] = result;
            this.BwrList = Object.assign([], this.BwrList);
            this.LoadBwrListintoMatGrid();        
          }          
        }
        
      });  
  }
  
  DeleteBorrower(Pty: TypeParties){         
    if (Pty.PartySno == 0)
    {
      this._snackBar.open('Error !! No Borrower is selected to delete', '',{horizontalPosition: 'center', verticalPosition: 'top', duration: 2000, panelClass: ['blue-snackbar'] });                        
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
            this.PtyService.deleteParty(Pty).subscribe((data:any ) => {
        
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
                  const index =  this.BwrList.indexOf(Pty);
                  this.BwrList.splice(index, 1);
                  this.LoadBwrListintoMatGrid();              
              }          
            });
          }
          
        });  

      
    }
    
  }
  

  applyFilterBwr(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBwr.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceBwr.paginator) {
      this.dataSourceBwr.paginator.firstPage();
    }
  }

}
