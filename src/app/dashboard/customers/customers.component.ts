import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TypeParties } from '../types/TypeParties';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CustomermasterComponent } from './customermaster/customermaster.component';
import { Router } from '@angular/router';
import { PartyService } from '../party.service';
import { MsgboxComponent } from '../msgbox/msgbox.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  displayedColumns: string[] = ['Sno', 'Party_Name', 'City','Mobile','Roi','Edit_Delete']; 
  dataSource!: MatTableDataSource<TypeParties>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  
  
  dataError: boolean = false;
  errDetails: string = "";
  loadingData: boolean = false;

  CustomersList: TypeParties[] = []; 
  constructor(private PtyService: PartyService, public dialog: MatDialog, private router: Router, private _snackBar: MatSnackBar) { 
    this.LoadCustomersList();    
  }

  ngOnInit(): void {
  }
 
  LoadCustomersList()
  { 
   this.loadingData = true;
    this.PtyService.getParties(0,1).subscribe((data:any ) =>  {         
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
      }
      else{              
         this.CustomersList = data;            
         this.LoadCustomersListintoMatGrid();          
      }              
    });    
    this.loadingData = false; 
  }
  LoadCustomersListintoMatGrid()
  {
     this.dataSource = new MatTableDataSource<TypeParties> (this.CustomersList);         
     setTimeout(() => this.dataSource.paginator = this.paginator);
     setTimeout(() => this.dataSource.sort = this.sort);
  } 

  OpenCustomerCreation(){
    var Cust: TypeParties = {
      PartySno: 0,
      Party_Type: 1,
      Party_Name: "",
      Address: "",
      City: "",
      Mobile: "", 
      Email: "",    
      Remarks: "",
      Roi: 0,
      Scheme:1
      
  } 
    const dialogRef = this.dialog.open(CustomermasterComponent, 
      {
      data: {Cust},
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          //this.CustomersList.unshift(result);            
          //this.LoadCustomersListintoMatGrid();        
          this.LoadCustomersList();
        }
        
      });  
  }

  AlterCustomer(Cust: TypeParties)
  {
    const dialogRef = this.dialog.open(CustomermasterComponent, 
      {
      data: {Cust},
      });
      
      dialogRef.disableClose = true; 

      dialogRef.afterClosed().subscribe(result => {        
        
        if (result)
        {
          if (result == "Delete")
          {
            const index =  this.CustomersList.indexOf(Cust);
            this.CustomersList.splice(index, 1);
            this.LoadCustomersListintoMatGrid();
          }
          else
          {
            const index =  this.CustomersList.indexOf(Cust);
            this.CustomersList[index] = result;
            this.CustomersList = Object.assign([], this.CustomersList);
            this.LoadCustomersListintoMatGrid();        
          }          
        }
        
      });  
  }
  
  DeleteCustomer(Pty: TypeParties){         
    if (Pty.PartySno == 0)
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
                  data: {DialogType:2, Message: "Customer Deleted successfully"},
                  });                  
                  dialogRef3.disableClose = true;     
                  const index =  this.CustomersList.indexOf(Pty);
                  this.CustomersList.splice(index, 1);
                  this.LoadCustomersListintoMatGrid();              
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
 