import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TypeParties } from '../../types/TypeParties';
import { PartyService } from '../../party.service';
import { MatTableDataSource } from '@angular/material/table';
import { TypeTransactions } from '../../types/TypeTransactions';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TypeRepledges } from '../../types/TypeRepledges';
import { MsgboxComponent } from '../../msgbox/msgbox.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from '../../transaction.service';
import { AppGlobalsService } from '../../app-globals.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-borrower-analysis',
  templateUrl: './borrower-analysis.component.html',
  styleUrls: ['./borrower-analysis.component.css']
})
export class BorrowerAnalysisComponent implements OnInit {

  constructor(private router: Router, private globals: AppGlobalsService, private PartyService: PartyService, private dialog: MatDialog, private TransService: TransactionService) { }

  @ViewChild('TABLE')  table!: ElementRef;
  
  StatementList: TypeRepledges[] = [];

  dataError: boolean = false;
  errDetails: string = "";  
  loadingData: boolean = false;

  dataSource!: MatTableDataSource<any>;  
  columnsToDisplay: string[] = ['Party_Name','RpGrams','RpValue','Principal_Paid','Interest_Paid','Other_Charges'];    
  expandedElement!: TypeRepledges | null;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  
  ngOnInit(): void {
  
   this.LoadBwrAnalysis();
  
  }

  LoadBwrAnalysis() 
  {    
   const dialogRef = this.dialog.open(MsgboxComponent, 
     {
       data: { "DialogType": 0}}
     );
     dialogRef.disableClose = true;

    this.TransService.LoadBwrAnalysis().subscribe((data:any ) =>  {       
      this.loadingData = false;       
      if (data === 0)
      {
        this.dataError  = true;
        this.errDetails = data;
        dialogRef.close();
      }
      else{                 
       this.StatementList = JSON.parse (data.apiData);     
       this.dataSource = new MatTableDataSource<TypeTransactions> (JSON.parse(data.apiData));            
       setTimeout(() => this.dataSource.paginator = this.paginator);
       setTimeout(() => this.dataSource.sort = this.sort);   
       dialogRef.close();           
      }      
    },    
    error => {
      // console.log  (error);
      this.loadingData = false;
      dialogRef.close();
    });    
    this.loadingData = false;
  }

  rowdetails(data: any)
  {    
    this.router.navigate(['dashboard/borrowers/borrowerdetailed',data.PartySno,data.Party_Name]);   
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportAsExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  /* save to file */
  XLSX.writeFile(wb, 'BorrowerAnalysis.xlsx');
}

RpGramsTotal ()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.RpGrams).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

RpValueTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.RpValue).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

Principal_PaidTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Principal_Paid).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}
Interest_PaidTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Interest_Paid).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}
Other_ChargesTotal()
{
  try {
    return this.dataSource.filteredData.map(t =>  t.Other_Charges).reduce((acc, value) => acc + value, 0);        
  } catch (error) {
    return 0;  
  }
}

}
